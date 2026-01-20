from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('signup/', views.signup_view, name='signup'),

    path('gemini-chat/', views.gemini_chat, name='gemini_chat'),

    path('dashboard/', views.dashboard, name='dashboard'),
    path('predict/', views.predict_selection, name='predict_selection'), # New Path
    path('book/day/', views.book_day, name='book_day'),
    path('book/hour/', views.book_hour, name='book_hour'),
    path('fetch-weather/', views.fetch_weather_data, name='fetch_weather'),

    path('stations/', views.station_map, name='station_map'),
    path('reserve/', views.reservation_view, name='reserve'),
    path('download-slip/<int:reservation_id>/', views.download_slip, name='download_slip'),

    path('about/', views.about, name='about'),
    path('reviews/', views.reviews, name='reviews'),
    path('profile/', views.profile, name='profile'),

    path('extract-pdf-data/', views.extract_pdf_api, name='extract_pdf_api'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)