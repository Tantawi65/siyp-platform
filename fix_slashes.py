import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove trailing slashes
    new_content = content.replace("fetch('/api/opportunities/')", "fetch('/api/opportunities')")
    new_content = new_content.replace("fetch('/api/tracker/')", "fetch('/api/tracker')")
    new_content = new_content.replace("fetch('/api/admin/opportunities/')", "fetch('/api/admin/opportunities')")
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {filepath}')

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))
