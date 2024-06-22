# Removes the word "Chipotle" from the name column in the CSV file
import csv

input_file = 'chipotle_locations_v2.csv'
output_file = 'cleaned_chipotle_locations.csv'

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    for row in reader:
        # Replace "Chipotle" with an empty string in the name column
        row[4] = row[4].replace('Chipotle ', '')
        writer.writerow(row)