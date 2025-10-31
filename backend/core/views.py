import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.conf import settings
from .models import Analysis
from .serializers import AnalysisSerializer

# Konfiguracja Gemini (raz)
genai.configure(api_key=settings.GEMINI_API_KEY)

PROMPT_TEMPLATE = """
Jesteś inteligentnym asystentem medycznym.
Na podstawie podanych objawów przedstaw listę maksymalnie 5 najbardziej prawdopodobnych diagnoz.
Dla każdej choroby użyj poniższego formatu Markdown:

**Nazwa choroby (np. Grypa, COVID-19, Zapalenie oskrzeli)**
Krótki opis objawów w jednym zdaniu.
Sugerowany specjalista: **nazwa lekarza**

Objawy:
\"\"\"
{symptoms}
\"\"\"

Dodatkowo (na końcu) wypisz w formacie JSON obiekt "confidence" z polami:
- "items": lista obiektów {{ "name": string, "prob": liczba 0-1 }}
Zadbaj, by JSON był w pojedynczym bloku trój-znakowych backticków jako ```json ... ```.
"""


class DiagnoseView(APIView):
    def post(self, request):
        symptoms = (request.data.get("symptoms") or "").strip()
        if not symptoms:
            return Response({"error": "Brak pola 'symptoms'."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            model = genai.GenerativeModel(model_name="models/gemini-2.5-flash")
            prompt = PROMPT_TEMPLATE.format(symptoms=symptoms)
            result = model.generate_content(prompt)
            text = result.text or ""

            # Wyciągnij JSON z końca (opcjonalny parsing)
            import json
            import re
            confidence = None
            m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.S)
            if m:
                try:
                    confidence = json.loads(m.group(1))
                except Exception:
                    confidence = None

            analysis = Analysis.objects.create(
                symptoms=symptoms,
                result_md=text,
                confidence_json=confidence
            )
            return Response({
                "id": analysis.id,
                "result_md": analysis.result_md,
                "confidence": analysis.confidence_json
            })
        except Exception as e:
            import traceback
            traceback.print_exc()  # <-- pokaże stacktrace w konsoli
            return Response({"error": str(e)}, status=500)


class AnalysisListView(APIView):
    def get(self, request):
        analyses = Analysis.objects.order_by("-created_at")[:20]
        serializer = AnalysisSerializer(analyses, many=True)
        return Response(serializer.data)


from django.http import JsonResponse

def list_models(request):
    import google.generativeai as genai
    from django.conf import settings

    genai.configure(api_key=settings.GEMINI_API_KEY)
    models = [m.name for m in genai.list_models()]
    return JsonResponse({"available_models": models})

# --- CZAT ---
class ChatView(APIView):
    """
    Czat medyczny AI — prowadzi rozmowę, ale bez utrzymywania stanu serwera.
    Historia przekazywana w każdym żądaniu.
    """

    def post(self, request):
        try:
            message = request.data.get("message", "").strip()
            history = request.data.get("history", [])

            if not message:
                return Response({"error": "Brak wiadomości."}, status=400)

            # Zbuduj prompt kontekstowy
            prompt = "Jesteś medycznym asystentem AI. Rozmawiasz z pacjentem o objawach.\n"
            for h in history:
                role = h.get("role", "user")
                content = h.get("content", "")
                if role == "user":
                    prompt += f"\nPacjent: {content}"
                else:
                    prompt += f"\nAsystent: {content}"
            prompt += f"\nPacjent: {message}\nAsystent:"

            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            ai_text = response.text.strip()

            return Response({"reply": ai_text})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
