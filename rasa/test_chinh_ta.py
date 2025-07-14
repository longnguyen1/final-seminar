import yaml

with open('domain.yml', encoding='utf-8') as f:
    domain = yaml.safe_load(f)
domain_intents = set(domain['intents'])

with open('data/stories.yml', encoding='utf-8') as f:
    stories = yaml.safe_load(f)
story_intents = set()
for story in stories['stories']:
    for step in story.get('steps', []):
        if 'intent' in step:
            story_intents.add(step['intent'])

print("Intent dùng trong stories nhưng thiếu ở domain:", story_intents - domain_intents)
print("Intent có trong domain nhưng không dùng trong stories:", domain_intents - story_intents)