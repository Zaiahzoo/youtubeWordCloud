import json
import re
import os
import requests
from collections import defaultdict

# Load the JSON file
with open('watch-history.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Create empty lists for titles and URLs
titles = []
urls = []

# Loop through each item in the JSON data
for entry in data:
    # Append the title and URL to respective lists
    if str(entry.get('time',''))[3] != '4':
        break
    elif entry.get('title', '') not in titles and 'https://' not in entry.get('title', ''):
	    titles.append(entry.get('title', ''))
	    urls.append(entry.get('titleUrl', ''))
    
    

def create_dictionary(titles):
    
    ignore = ['from', 'and', 'the', 'watched', 'i', 'in', 'to', 'a', 's', 'you', 'my', 'on', 'me', 'of', 'how', 'for', 'it', 'is', 'with', 'feat', '1', 't', 'official', 'this', 'x', 'juice', 'wrld', 'why', 'your', '000', '2', 'can']
    word_count = defaultdict(int)
    
    for entry in titles:
        words = re.findall(r'\b\w+\b', entry.lower())
        
        for word in words:
            if word in ignore:
                continue
            else:
                word_count[word] += 1
    return word_count
    
def analyze_frequency(word_count_dict):
    # Sort the dictionary by count in descending order and convert it into a list of tuples
    sorted_word_counts = sorted(word_count_dict.items(), key=lambda x: x[1], reverse=True)
    
    # Extract the top 10 words (ignore the counts, just take the words)
    top_ten_words = [word for word, count in sorted_word_counts[:15]]
    
    return top_ten_words

def group_videos_by_top_words(titles, urls, top_words):
    # Create a dictionary with each top word as a key and an empty list as the value
    grouped_videos = {word: [] for word in top_words}

    # Loop through each title and URL
    for title, url in zip(titles, urls):
        # Convert the title to lowercase
        title_lower = title.lower()

        # Check if the title contains any of the top words
        for word in top_words:
            if re.search(rf'\b{word}\b', title_lower):  # Use regex to match whole words
                # Append the title and URL as a dictionary
                grouped_videos[word].append({'title': title, 'url': url})

    return grouped_videos



# Function to extract video ID from the URL
def get_video_id(url):
    # Use regex to extract the 'v' parameter from the URL
    match = re.search(r'v=([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    return None

# Function to download thumbnails for each grouped video and save them in corresponding folders
def download_thumbnails(grouped_videos):
    base_thumbnail_url = "https://img.youtube.com/vi/{}/maxresdefault.jpg"
    
    # Create a base directory for the thumbnails
    base_dir = 'thumbnails'
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
    
    # Loop through each group (based on the top words)
    for word, video_data in grouped_videos.items():
        # Create a folder for each word group
        word_dir = os.path.join(base_dir, word)
        if not os.path.exists(word_dir):
            os.makedirs(word_dir)
        
        # Loop through each video data in the group
        for video in video_data:
            title, url = video['title'], video['url']
            video_id = get_video_id(url)
            
            if video_id:
                # Construct the thumbnail URL
                thumbnail_url = base_thumbnail_url.format(video_id)
                
                # Download the thumbnail
                response = requests.get(thumbnail_url)
                
                if response.status_code == 200:
                    # Save the thumbnail in the word folder
                    thumbnail_path = os.path.join(word_dir, f"{video_id}.jpg")
                    with open(thumbnail_path, 'wb') as file:
                        file.write(response.content)
                    print(f"Downloaded thumbnail for video: {title}")
                else:
                    print(f"Failed to download thumbnail for video: {title} (status code: {response.status_code})")
            else:
                print(f"Could not extract video ID from URL: {url}")
                
    
dictionary = create_dictionary(titles)
top_ten = analyze_frequency(dictionary)
grouped_videos = group_videos_by_top_words(titles, urls, top_ten)
download_thumbnails(grouped_videos)


# for word, video_list in grouped_videos.items():
#     print(f"\nVideos containing '{word}':")
#     for video in video_list:
#         print(f"- {video[8:]}")
