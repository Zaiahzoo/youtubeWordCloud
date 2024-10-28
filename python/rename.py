import os

def rename_images_in_folders(base_directory):
    # Loop through each folder in the base directory
    for folder_name in os.listdir(base_directory):
        folder_path = os.path.join(base_directory, folder_name)
        
        # Check if it's a directory
        if os.path.isdir(folder_path):
            # List all files in the folder
            files = os.listdir(folder_path)
            image_count = 1
            
            # Loop through each file in the folder
            for file_name in files:
                # Get the file extension (e.g., .jpg, .png)
                file_extension = os.path.splitext(file_name)[1]
                
                # Construct the new file name (image1.jpg, image2.png, etc.)
                new_file_name = f"image{image_count}{file_extension}"
                new_file_path = os.path.join(folder_path, new_file_name)
                old_file_path = os.path.join(folder_path, file_name)
                
                # Check if the new file name already exists
                while os.path.exists(new_file_path):
                    image_count += 1
                    new_file_name = f"image{image_count}{file_extension}"
                    new_file_path = os.path.join(folder_path, new_file_name)

                # Rename the file
                os.rename(old_file_path, new_file_path)
                print(f"Renamed: {file_name} -> {new_file_name}")
                
                image_count += 1

# Specify the path to the 'thumbnails' directory
base_directory = 'thumbnails'

# Call the function to rename the images
rename_images_in_folders(base_directory)
