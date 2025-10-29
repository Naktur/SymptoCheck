from django.db import models

class Analysis(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    symptoms = models.TextField()
    result_md = models.TextField()  # zapisujemy wynik w Markdown
    # Opcjonalnie meta
    confidence_json = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Analysis #{self.id} @ {self.created_at:%Y-%m-%d %H:%M}"
