from django.urls import path
from .views import DiagnoseView, AnalysisListView

urlpatterns = [
    path("diagnose/", DiagnoseView.as_view(), name="diagnose"),
    path("analyses/", AnalysisListView.as_view(), name="analyses"),
]
