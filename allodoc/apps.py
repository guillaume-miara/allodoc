from django.apps import AppConfig


class MainConfig(AppConfig):
    name = 'allodoc'
    verbose_name = "Main"

    def ready(self):
        """Override this to put in:
            Users system checks
            Users signal registration
        """
        pass
