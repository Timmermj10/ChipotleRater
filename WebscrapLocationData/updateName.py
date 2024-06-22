# Update the lines of the CSV where the name is the same as the address
import csv
import requests
from bs4 import BeautifulSoup

lines = []

with open('cleaned_chipotle_locations.csv', mode='r', encoding='utf-8') as file:
    csv_reader = csv.DictReader(file)
    
    # Step 2: Loop through each row
    for row in csv_reader:
        # Check if address matches the name
        if row['address'] == row['name']:
            try:
                # Update URL to go to city, to check if there is only 1 location in this city
                response = requests.get('/'.join(row['url'].split('/')[:-1]))
                response.raise_for_status()  # Raises an HTTPError for bad responses

                soup = BeautifulSoup(response.text, 'html.parser')
                number = soup.find(class_='Directory-title')

                number = int(number.get_text().split()[0])

                if number == 1:
                    row['name'] = row['city']

                else:
                    # Step 3: Make an HTTP request to the URL
                    response = requests.get(row['url'])
                    response.raise_for_status()  # Raises an HTTPError for bad responses
                    
                    # Step 4: Parse the HTML
                    soup = BeautifulSoup(response.text, 'html.parser')
                    core_streets_elements = soup.find(class_='Core-streets')
                    
                    # Extract and print the text from each 'Core-streets' element
                    if core_streets_elements is not None:
                        if core_streets_elements.get_text().strip() != '':
                            if core_streets_elements.get_text().find('.') != 0 and row['city'] == 'New York':
                                row['name'] = ' '.join(' '.join(core_streets_elements.get_text().split()[1:]).split('.')[:1])
                            else:
                                row['name'] = ' '.join(core_streets_elements.get_text().split()[1:])
                        else:
                            core_city_elements = soup.find(class_='c-address-city')
                            row['name'] = f'{' '.join(row['address'].split()[1:-1])} - {core_city_elements.get_text()}'
                
                lines.append(row)

            except requests.RequestException as e:
                print(f"Request error: {e}")
            except Exception as e:
                print(f"An error occurred: {e}")
        else:
            lines.append(row)

# Write processed data back to the same CSV
with open('cleaned_chipotle_locations_v2.csv', mode='w', newline='', encoding='utf-8') as file:
    # Ensure you include new fieldnames if you've added any new data
    fieldnames = csv_reader.fieldnames  # Adjust based on your actual modifications
    csv_writer = csv.DictWriter(file, fieldnames=fieldnames)
    csv_writer.writeheader()

    for row in lines:
        csv_writer.writerow(row)    