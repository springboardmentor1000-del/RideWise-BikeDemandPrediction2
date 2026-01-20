from django import forms
from datetime import date

class DayPredictionForm(forms.Form):
    date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        initial=date.today
    )
    season = forms.ChoiceField(choices=[
        (1, 'Spring'), (2, 'Summer'), (3, 'Fall'), (4, 'Winter')
    ])
    weathersit = forms.ChoiceField(choices=[
        (1, 'Clear'),
        (2, 'Mist'),
        (3, 'Light Rain'),
        (4, 'Heavy Rain')
    ])
    temp = forms.FloatField(label="Temperature (°C)")
    hum = forms.FloatField(label="Humidity")
    windspeed = forms.FloatField(label="Windspeed")

class HourPredictionForm(DayPredictionForm):
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}),initial=date.today)
    hr = forms.IntegerField(label="Hour (0–23)", initial=12)
    season = forms.ChoiceField(choices=[
        (1, 'Spring'), (2, 'Summer'), (3, 'Fall'), (4, 'Winter')
    ])
    weathersit = forms.ChoiceField(choices=[
        (1, 'Clear'),
        (2, 'Mist'),
        (3, 'Light Rain'),
        (4, 'Heavy Rain')
    ])
    temp = forms.FloatField(label="Temperature (°C)")
    hum = forms.FloatField(label="Humidity")
    windspeed = forms.FloatField(label="Windspeed")

