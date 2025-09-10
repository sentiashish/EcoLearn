# Create file: apps/challenges/management/commands/populate_challenges.py

from django.core.management.base import BaseCommand
from apps.challenges.models import ChallengeData

class Command(BaseCommand):
    help = 'Populate challenge data'

    def handle(self, *args, **options):
        challenges = [
            {
                'id': 1,
                'title': 'Carbon Footprint Calculator',
                'description': 'Build a calculator that estimates daily carbon emissions based on transportation, energy use, and consumption habits.',
                'difficulty': 'Easy',
                'category': 'Climate',
                'points': 100,
                'submissions': 1250,
                'success_rate': 78.0,
                'time_limit': '45 min',
                'tags': ['Math', 'Environment', 'Beginner']
            },
            {
                'id': 2,
                'title': 'Tree Plantation',
                'description': 'Plant a tree in this week.',
                'difficulty': 'Medium',
                'category': 'Plantation',
                'points': 300,
                'submissions': 567,
                'success_rate': 45.0,
                'time_limit': '1 week',
                'tags': ['Environment', 'Outdoor']
            }
        ]

        for challenge_data in challenges:
            challenge, created = ChallengeData.objects.get_or_create(
                id=challenge_data['id'],
                defaults=challenge_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created challenge: {challenge.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Challenge already exists: {challenge.title}')
                )

        self.stdout.write(self.style.SUCCESS('Successfully populated challenge data'))