import json
import sqlite3
from urllib.parse import urlparse
from flask import Flask, redirect, render_template, request, jsonify, request_finished, url_for
import requests
import hashlib

app = Flask(__name__)

# API Key for getting Performance metrics from Google Cloud Platform.
api_key = "AIzaSyAMxH6RrD0C_l9rPEbWiu42lBW0GW35LAQ"

# Create a SQLite database and a table for URL requests.
conn = sqlite3.connect("mydatabase.db")
cursor = conn.cursor()
# Create the "url_requests" table.
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS url_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        method TEXT,
        domain TEXT,
        scheme TEXT,
        path TEXT
    )
"""
)

# Create the "responses" table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        status_code INTEGER,
        location TEXT,
        server TEXT,
        date TEXT,
        FOREIGN KEY (request_id) REFERENCES url_requests (id)
    )
"""
)

# Create the "hash_table" table
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS hash_table (
        request_id INTEGER,
        hashed_id TEXT
    )
"""
)

# Getting data from InputForm (first page), taking the responses and storing requests and responses into the DB, 
# meanwhile, it extracts the relevant info from URL request and give back the hashed request ID to front for routing to the second (Share) page
@app.route('/api', methods=['POST'])
def handle_api_request():
    data = request.get_json() # Assuming the data is sent as JSON
    url = data['url']
    parsed_url = urlparse(url)
    # URL Details
    method = request.method
    domain = parsed_url.netloc
    scheme = parsed_url.scheme
    path = parsed_url.path
    # Store the URL details in the database
    conn = sqlite3.connect("mydatabase.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO url_requests (url, method, domain, scheme, path) VALUES (?, ?, ?, ?, ?)",
        (url, method, domain, scheme, path),
    )
    # Get the ID of the inserted URL request
    request_id = cursor.lastrowid
    # hash the ID
    hashed_id = hashlib.sha256(str(request_id).encode()).hexdigest()
    # storing ID and hashed ID in the table
    cursor.execute(
        "INSERT INTO hash_table (request_id, hashed_id) VALUES (?, ?)",
        (request_id, hashed_id),
    )
    conn.commit()

    try:
        # Looping on the responses till it gets a 200 OK response
        while True:
            
            # Send a GET request with allow_redirects=True to follow redirects (supporting 3XX responses)
            response = requests.get(url, allow_redirects=False)

            status_line = f"HTTP/1.1 {response.status_code} {response.reason}"
            location = f"Location: {response.headers.get('Location', 'N/A')}"
            server = f"Server: {response.headers.get('Server', 'N/A')}"
            date = f"Date: {response.headers.get('Date', 'N/A')}"
            # Save the responses into DB            
            cursor.execute(
                "INSERT INTO responses (request_id, status_code, location, server, date) VALUES (?, ?, ?, ?, ?)",
                (request_id, status_line, location, server, date),
            )
            
            conn.commit()

            # Update the URL for the next redirect
            if response.is_redirect: 
                location = response.headers['Location']
                print(location)
                parsed_location = urlparse(location)
                if parsed_location.netloc:
                    url = location
                else:
                    url = scheme + "://" + domain + location
                print("URL: " + url)


            if not response.is_redirect:
                break
    
        conn.commit()
        conn.close()

        return jsonify({'data': hashed_id})

    except Exception as e:
        return jsonify({'error': str(e)}) 
    

# In this endpoint I got the hashed request id from the routing App.js and retriving the actual request id
# by DB and then retriving all the other information for Request and Responses and send them to the front
# for presentation. The data for performance of the URL is doing by another endpoint to accelerate the page
# loading. 
@app.route('/show_response', methods = ['POST'])
def show_response():
    data = request.json  # Assuming the data is sent as JSON
    
    hashed_id = data['data']
    page_url = "http://localhost:3000/" + str(hashed_id)   

    # Connect to DB to extract the page information
    conn = sqlite3.connect("mydatabase.db")
    cursor = conn.cursor()
    cursor.execute("SELECT request_id FROM hash_table WHERE hashed_id = ?", (hashed_id,))
    request_id = cursor.fetchone()
    conn.close()

    # Retrieve the data associated with the request using the request_id
    conn = sqlite3.connect("mydatabase.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM url_requests WHERE id = ?", (request_id[0],))
    row = cursor.fetchone()
    conn.close()

    if row:
        # Request information details
        url, method, domain, scheme, path = row[1], row[2], row[3], row[4], row[5]
        # Adding the Request Info to response data to send it to the Share Page (second page)
        req_res_data = {
            "Request": {
                "url": url,
                "method": method,
                "domain": domain,
                "scheme": scheme,
                "path": path,
            }
        }

        # Fetch the responses information from the "responses" table
        conn = sqlite3.connect("mydatabase.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM responses WHERE request_id = ?", (request_id[0],))
        response_rows = cursor.fetchall() # all the responses
        conn.close()
        
        responses_data = []
        if response_rows:
            for index, response_row in enumerate(response_rows):
                status_line, location, server, date = (
                    response_row[2],
                    response_row[3],
                    response_row[4],
                    response_row[5],
                )
                responses_data.append([status_line, location,server,date])

    # adding all the responses info and page url to response data to send it to the Share Page (second page) 
    req_res_data["Responses"] = responses_data    
    req_res_data["PageURL"] = page_url
    return jsonify({'data': req_res_data})


# The data from performance are calculating by Google Cloud Platform and it take time to calculate them
# this is the reason why we are using another endpoint for this reason. When the Share page is loaded, the 
# performance part is not shown at first and then the performance data will be come to front with a delay. 
@app.route('/api/performance', methods=['POST'])
def get_performance_data():
    # Simulate getting performance data
    url = request.json.get('url')  # Extract URL from the request
    key = api_key 
    performance_data = performance_cal(url, key)
    return jsonify(performance_data)


def performance_cal(url, api_key):
    pagespeed_api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&key={api_key}"
    response_api = requests.get(pagespeed_api_url)
    data_performance = response_api.json()
    if "loadingExperience" in data_performance:
        loading_experience = data_performance["loadingExperience"]

        # Check if "metrics" is present in the "loadingExperience" data
        if "metrics" in loading_experience:
            metrics = loading_experience["metrics"]
            fcp = metrics.get("FIRST_CONTENTFUL_PAINT_MS", None)
            fid = metrics.get("FIRST_INPUT_DELAY_MS", None)
            clss = metrics.get("CUMULATIVE_LAYOUT_SHIFT_SCORE", None)
            lcp = metrics.get("LARGEST_CONTENTFUL_PAINT_MS", None)
        else:
            print("Metrics not found in loadingExperience data")
    else:
        print("loadingExperience not found in the response")
    
    # Define logical maximum values for each metric, the values are investigated by the papers
    max_fcp = 4000 
    max_fid = 100    
    max_cls = 10    
    max_lcp = 4000   
    # Scaling based on 100 to show it on circle charts of the page
    target_proportion = 100
    scaled_fcp = scale_metric(fcp['percentile'], max_fcp, target_proportion)
    scaled_fid = scale_metric(fid['percentile'], max_fid, target_proportion)
    scaled_cls = scale_metric(clss['percentile'], max_cls, target_proportion)
    scaled_lcp = scale_metric(lcp['percentile'], max_lcp, target_proportion)
    # Performance Data
    performance_data = {
        'fcp': fcp['percentile'],
        'fid': fid['percentile'],
        'clss': clss['percentile'],
        'lcp': lcp['percentile'],
        'scaled_fcp': scaled_fcp,
        'scaled_fid': scaled_fid,
        'scaled_cls': scaled_cls,
        'scaled_lcp': scaled_lcp
    }

    return performance_data

def scale_metric(value, max_value, target_proportion):
    if value is None:
        return None
    # Calculate the proportion of the value relative to the maximum
    proportion = min(value / max_value, 1.0)
    # Scale the value based on the target proportion (90)
    scaled_value = (proportion / 1.0) * target_proportion
    return scaled_value



    return None

if __name__ == '__main__':
    app.run()