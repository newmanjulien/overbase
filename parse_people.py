import csv
import re

def parse_scratch_md(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]

    people = []
    
    # Start parsing after "Search type, title, company, name" line
    start_index = 0
    for i, line in enumerate(lines):
        if "Search type, title, company, name" in line:
            start_index = i + 1
            break
    
    if start_index == 0:
        start_index = 32

    # Keywords should be matched as full words
    keywords = ["CEO", "FOUNDER", "DIRECTOR", "MANAGER", "PRESIDENT", "CHIEF", "VP", "SVP", "EVP", "CRO", "CMO", "CIO", "CCO", "COO", "OWNER", "PARTNER", "PRINCIPAL", "LEADER", "COACH", "LECTURER", "STRATEGIST", "CONSULTANT"]
    keyword_pattern = re.compile(r'\b(' + '|'.join(keywords) + r')\b', re.IGNORECASE)

    i = start_index
    while i < len(lines):
        line = lines[i]
        if not line:
            i += 1
            continue
        
        # Stop if we hit footer elements
        if any(stop_word in line.lower() for stop_word in ["©2025", "privacy policy", "community login", "background image"]):
            break

        name = line
        
        # Check if next line is a repeat of the name
        next_i = i + 1
        if next_i < len(lines) and lines[next_i] == name:
            next_i += 1
        
        # Now looking for title/company line
        title = ""
        company = ""
        
        if next_i < len(lines):
            potential_info = lines[next_i]
            
            # If the next line is the start of a NEW name (repeated), then current person has no title
            is_next_person = False
            if next_i + 1 < len(lines) and lines[next_i] == lines[next_i + 1]:
                is_next_person = True
            
            if not is_next_person:
                # Heuristic for title/company: has comma OR matches keywords
                if "," in potential_info or keyword_pattern.search(potential_info):
                    if "," in potential_info:
                        parts = [p.strip() for p in potential_info.split(',')]
                        if len(parts) >= 2:
                            # Usually "Title, Company" or "Title, Subtitle, Company"
                            # We'll take the last as company, rest as title
                            company = parts[-1]
                            title = ", ".join(parts[:-1])
                        else:
                            title = parts[0]
                    else:
                        title = potential_info
                    next_i += 1
        
        # Final check: if title is too short or looks like a name, skip it (optional)
        # But for now, this logic should be much better.
        
        people.append({
            "Name": name,
            "Title": title,
            "Company": company
        })
        
        i = next_i

    return people

def save_to_csv(people, output_path):
    fieldnames = ["Name", "Title", "Company"]
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for person in people:
            writer.writerow(person)

if __name__ == "__main__":
    input_file = "/Users/juliennewman/.gemini/antigravity/scratch/scratch.md"
    output_file = "/Users/juliennewman/Documents/overbase/people.csv"
    
    people_data = parse_scratch_md(input_file)
    save_to_csv(people_data, output_file)
    print(f"Successfully extracted {len(people_data)} people to {output_file}")
