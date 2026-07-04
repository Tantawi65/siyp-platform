import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    PREFIX = "(import.meta.env.VITE_API_URL || '') + "
    new_content = content.replace(f"fetch({PREFIX}'/api/", "fetch('/api/")
    new_content = new_content.replace(f"fetch({PREFIX}`/api/", "fetch(`/api/")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Reverted {filepath}')

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))
