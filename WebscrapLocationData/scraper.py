import requests
from bs4 import BeautifulSoup
import time
import random
import csv

def scrape_chipotle_states(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    states = []

    # Select the list of links to each of the states with a chipotle
    for ul in soup.select('ul.Directory-listLinks'):
        # Loop through each of the list items
        for li in ul.select('li'): 
            # Get the state name and the link to the state page
            state = li.select_one('a span').text
            state_link = li.select_one('a')['href']

            # Add the state and link to the locations list
            states.append({
                'state': state,
                'link': state_link
            })
    return states

def scrape_chipotle_cities(url, locations):
    # Loop through the states 
    for state in locations:
        # Format the url for the state page
        url_city = f"{url}{state['link']}"

        response = requests.get(url_city)
        soup = BeautifulSoup(response.text, 'html.parser')

        cities = []

        # Select the list of links to each of the cities with a chipotle
        for ul in soup.select('ul.Directory-listLinks'):
            # Loop through each of the list items
            for li in ul.select('li'): 
                # Get the city name and the link to the state page
                city = li.select_one('a span').text
                city_link = li.select_one('a')['href']

                # Add the city and link to the cities list
                cities.append({
                    'city': city,
                    'link': city_link
                })

        # Add the cities to the state
        state['cities'] = cities

        # Choose a random amount of time between 0.75 and 1.5
        wait = random.uniform(0.5, 1)

        # Wait for 1 second before making the next request
        time.sleep(wait)
    return locations

def scrape_chipotle_locations(url, locations):
    # Loop through the states
    for state in locations:
        # Loop through the cities
        for city in state['cities']:
            print(f'Finding locations in {city['city']}')

            # Format the url for the city page
            if city['link'].count('/') == 2:
                url_city = url + '/'.join(city['link'].split('/')[:-1])
            else:
                url_city = f"{url}{city['link']}"

            response = requests.get(url_city)
            soup = BeautifulSoup(response.text, 'html.parser')

            chipotles = []

            # Check if there is only one location in the city
            # if city['link'].count('/') == 2:
            #     print(city['link'])
            #     print('/'.join(city['link'].split('/')[:-1]))
            #     location = city['link'].split('/')[-1]
            #     chipotles.append({
            #         'location': location,
            #         'link': '/'.join(city['link'].split('/')[:-1])
            #     })

            # else:
            # Select the list of links to each of the locations within the city
            for ul in soup.select('ul.Directory-listTeasers'):
                # Loop through each of the list items
                for li in ul.select('li'): 
                    # Get the location name and the link to the location page
                    location = li.select_one('article h2 a span').text
                    location_link = li.select_one('article h2 a')['href']

                    # Add the location and link to the locations list
                    chipotles.append({
                        'location': location,
                        'link': location_link
                    })

            # Add the locations to the data
            city['locations'] = chipotles

            # Choose a random amount of time between 0.75 and 1.5
            wait = random.uniform(0.5, 1)

            # Wait for 1 second before making the next request
            time.sleep(wait)
    return locations

def scrape_chipotle_addresses_phone(url):
    # Get the data for the states
    states = scrape_chipotle_states(url)

    print(f'----- States done -----')
    print(states)

    # Get the data for the cities
    cities = scrape_chipotle_cities(url, states)

    print(f'----- Cities done -----')
    print(cities)

    # Get the data for the locations
    locations = scrape_chipotle_locations(url, cities)

    print(f'----- Locations done -----')
    print(locations)

    # Now we need to go to the page for each location and grab the address and phone number of each location
    # The class is core address and Core-phone js-core-phone
    # Loop through the states
    for state in locations:
        # Loop through the cities
        for city in state['cities']:
            # Loop through the locations
            for location in city['locations']:
                print(f'Working on {location['location']}')
                # Remove any leading .'s
                location['location'] = location['location'].lstrip('.')

                # Format the url for the location page
                url_location = f"{url}{location['link']}"

                response = requests.get(url_location)
                soup = BeautifulSoup(response.text, 'html.parser')

                info = []

                # Get the location name and the link to the location page
                address = None
                city = None
                postal_code = None
                number = None
                lat = None
                long = None

                # Just incase one of the Chipotles doesn't have the information
                try:
                    address = soup.select_one('span.c-address-street-1').text
                except AttributeError:
                    address = None
                try:
                    city = soup.select_one('span.c-address-city').text
                except AttributeError:
                    city = None
                try:
                    postal_code = soup.select_one('span.c-address-postal-code').text
                except AttributeError:
                    postal_code = None
                try:
                    number = soup.select_one('a.Phone-link').text
                except AttributeError:
                    number = None
                try:
                    lat = soup.select_one('meta[itemprop="latitude"]')
                    lat = lat['content'] if lat else None
                except AttributeError:
                    lat = None

                try:
                    long = soup.select_one('meta[itemprop="longitude"]')
                    long = long['content'] if long else None
                except AttributeError:
                    long = None

                # Add the information to the info list
                info.append({
                    'address': address,
                    'city': city,
                    'postal_code': postal_code,
                    'phone_number': number,
                    'latitude': lat,
                    'longitude': long
                })

                # Add the locations to the data
                location['info'] = info

                # Choose a random amount of time between 0.75 and 1.5
                wait = random.uniform(0.5, 1)

                # Wait for 1 second before making the next request
                time.sleep(wait)
    return locations

def clean_chipotle_data(data):
    # This is meant to get all of the data into a clean format for transportation to a database
    clean_data = []

    # Loop through the states
    for state in data:
        # Loop through the cities
        for city in state['cities']:
            # Loop through the locations
            for location in city['locations']:
                print(f'Cleaning {location['location']}')

                # Loop through the location info
                # for info in location['info']:
                #     # Add the state to the info
                #     info['state'] = state['state']

                for info in location['info']:
                    # Create a new list to be written to the csv
                    clean_data.append({
                        'state': state['state'],
                        'city': info['city'],
                        'address': info['address'],
                        'zip_code': info['postal_code'],
                        'name': location['location'],
                        'phone': info['phone_number'],
                        'latitude': info['latitude'],
                        'longitude': info['longitude'],
                        'url': 'https://locations.chipotle.com/' + location['link'],
                        'country': 'USA'
                    })
    return clean_data

def write_to_csv(data, filename):
 with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['state', 'city', 'address', 'zip_code', 'name', 'phone', 'latitude', 'longitude', 'url', 'country']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in data:
            writer.writerow(row)

# The format of the links to each individual state page is: https://locations.chipotle.com/{state_link}

# Now we have a list of locations, each with a state, a link to the state page, and a list of cities in that state with a link to the city page

# We now need to loop through each of the cities, some cities have multiple chipotles, some only have one
# When there is only one the link will have two /'s, when there are multiple the link will have one / followed by the city name
# When looping through the cities, if there is already two /'s, just mark that as the location and move on

data = scrape_chipotle_addresses_phone('https://locations.chipotle.com/')

# print(data)

write_to_csv(clean_chipotle_data(data), 'chipotle_locations_v2.csv')

# Now we have a full list of all of the Chipotle locations with links to each location page

# Now we need to loop through all the locations and scrape the data from each location page
# The data that we need is the address, phone number, latitude, and longitude of each location
