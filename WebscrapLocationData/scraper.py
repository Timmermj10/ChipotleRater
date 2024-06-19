import requests
from bs4 import BeautifulSoup
import time
import random

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
    for state in locations[:1]:
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
        wait = random.uniform(0.75, 1.5)

        # Wait for 1 second before making the next request
        time.sleep(wait)
    return locations

def scrape_chipotle_locations(url, locations):
    # Loop through the states
    for state in locations[:1]:
        # Loop through the cities
        for city in state['cities']:
            # Format the url for the city page
            url_city = f"{url}{city['link']}"

            response = requests.get(url_city)
            soup = BeautifulSoup(response.text, 'html.parser')

            chipotles = []

            # Check if there is only one location in the city
            if city['link'].count('/') == 2:
                location = city['link'].split('/')[-1]
                chipotles.append({
                    'location': location,
                    'link': city['link']
                })

            else:
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
            wait = random.uniform(0.75, 1.5)

            # Wait for 1 second before making the next request
            time.sleep(wait)
    return locations

def scrape_chipotle_addresses_phone(url):
    # Get the data for the states
    states = scrape_chipotle_states(url)

    # Get the data for the cities
    cities = scrape_chipotle_cities(url, states)

    # Get the data for the locations
    locations = scrape_chipotle_locations(url, cities)

    # Now we need to go to the page for each location and grab the address and phone number of each location
    # The class is core address and Core-phone js-core-phone
    return locations

# The format of the links to each individual state page is: https://locations.chipotle.com/{state_link}

# Now we have a list of locations, each with a state, a link to the state page, and a list of cities in that state with a link to the city page

# We now need to loop through each of the cities, some cities have multiple chipotles, some only have one
# When there is only one the link will have two /'s, when there are multiple the link will have one / followed by the city name
# When looping through the cities, if there is already two /'s, just mark that as the location and move on

data = scrape_chipotle_addresses_phone('https://locations.chipotle.com/')

# Now we have a full list of all of the Chipotle locations with links to each location page

# Now we need to loop through all the locations and scrape the data from each location page
# The data that we need is the address and phone number of each location

print(data)