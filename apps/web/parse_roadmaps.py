import json
import re
import os

with open('extracted_roadmaps.txt', 'r', encoding='utf-8') as f:
    text = f.read()

role_names = [
    'Frontend Developer', 'Backend Developer', 'Data Engineer',
    'Business Analyst', 'Database Administrator', 'Agentic AI Engineer',
    'Cybersecurity Analyst', 'Mobile App Developer', 'Cloud Architect',
    'Product Manager'
]

# Find where each role starts (after the initial list of roles around line 16)
first_content_idx = text.find('Frontend Developer', 150)

parsed_roles = {}

for i, role in enumerate(role_names):
    start = text.find(role, first_content_idx)
    if i + 1 < len(role_names):
        next_role = role_names[i + 1]
        end = text.find(next_role, start + len(role))
    else:
        end = len(text)
    
    role_text = text[start:end]
    
    weeks = []
    # Split by Week 1:, Week 2:, Week 3:, Week 4:
    week_splits = re.split(r'\n(?=Week [1-4]:)', role_text)
    
    for w_idx, w_text in enumerate(week_splits[1:]):
        w_lines = [l.strip() for l in w_text.strip().split('\n') if l.strip()]
        w_title = w_lines[0] if w_lines else f"Week {w_idx + 1}"
        
        goal = ''
        proj_title = ''
        proj_desc = ''
        proj_tools = ''
        proj_deliverable = ''
        success_criteria = ''
        
        for line in w_lines:
            if line.startswith('Goal:'):
                goal = line.replace('Goal:', '').strip()
            elif 'Weekly Project:' in line:
                proj_title = line.split('Weekly Project:')[-1].strip()
            elif line.startswith('Tech / Tools:'):
                proj_tools = line.replace('Tech / Tools:', '').strip()
            elif line.startswith('Deliverable:'):
                proj_deliverable = line.replace('Deliverable:', '').strip()
            elif 'Success Criteria:' in line:
                success_criteria = line.split('Success Criteria:')[-1].strip()
        
        # Days
        days = []
        day_matches = list(re.finditer(r'(Day [1-7] \([A-Za-z]+\))', w_text))
        for d_i, d_match in enumerate(day_matches):
            d_name = d_match.group(1)
            d_start = d_match.end()
            if d_i + 1 < len(day_matches):
                d_end = day_matches[d_i + 1].start()
            else:
                d_end = w_text.find('Success Criteria:', d_start)
                if d_end == -1:
                    d_end = len(w_text)
            
            d_chunk = w_text[d_start:d_end].strip()
            d_lines = [dl.strip() for dl in d_chunk.split('\n') if dl.strip()]
            
            focus = d_lines[0] if len(d_lines) > 0 else ''
            tasks = []
            hrs = 2
            resources = ''
            
            for dl in d_lines[1:]:
                if dl.startswith('•'):
                    tasks.append(dl.lstrip('•').strip())
                elif re.match(r'^\d+(\.\d+)?$', dl):
                    hrs = float(dl)
                elif dl != '-' and len(dl) > 2 and not dl.startswith('•'):
                    resources = dl
            
            days.append({
                'day': d_name,
                'focus': focus,
                'tasks': tasks if tasks else [focus],
                'hours': hrs,
                'resources': resources
            })
            
        weeks.append({
            'week': w_idx + 1,
            'title': w_title,
            'goal': goal,
            'project': {
                'title': proj_title,
                'tools': proj_tools,
                'deliverable': proj_deliverable
            },
            'days': days,
            'successCriteria': success_criteria
        })
        
    parsed_roles[role] = {
        'role': role,
        'weeks': weeks
    }
    num_days = sum(len(w['days']) for w in weeks)
    print(f"Parsed {role}: {len(weeks)} weeks, {num_days} days total")

# Also add aliases so 'Data Analyst' and 'Software Engineer' map cleanly if selected
if 'Business Analyst' in parsed_roles and 'Data Analyst' not in parsed_roles:
    # Clone and adapt for Data Analyst
    da = json.loads(json.dumps(parsed_roles['Data Engineer']))
    da['role'] = 'Data Analyst'
    parsed_roles['Data Analyst'] = da

if 'Software Engineer' not in parsed_roles:
    se = json.loads(json.dumps(parsed_roles['Backend Developer']))
    se['role'] = 'Software Engineer'
    parsed_roles['Software Engineer'] = se

os.makedirs('apps/web/js/data', exist_ok=True)

# Write as JS module / global script
js_content = f"/* Auto-generated 4-week placement roadmaps for all 10 roles */\nconst ROADMAP_FALLBACK_DATA = {json.dumps(parsed_roles, indent=2)};\nif (typeof module !== 'undefined') module.exports = ROADMAP_FALLBACK_DATA;\n"
with open('apps/web/js/data/roadmap-templates.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

with open('apps/web/js/data/roadmap-templates.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_roles, f, indent=2)

print("SUCCESS: Generated apps/web/js/data/roadmap-templates.js and .json")
