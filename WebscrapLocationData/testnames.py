# Just used to see which Chipotles have their address as their name
import csv

input_file = 'cleaned_chipotle_locations.csv'
output_file = 'filtered_chipotle_locations.csv'

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()
    
    for row in reader:
        # Corrected to use DictReader and DictWriter for accessing by column names
        if row['name'] == row['address']:
            writer.writerow(row)