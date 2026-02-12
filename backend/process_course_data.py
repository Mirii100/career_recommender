import pandas as pd
import numpy as np

print("Processing course data...")

# Load the datasets
try:
    combined_courses_df = pd.read_csv('data/combined_courses.csv')
    courses_df = pd.read_csv('data/courses.csv')
    coursera_df = pd.read_csv('data/Coursera.csv')
    udemy_df = pd.read_csv('data/udemy_courses.csv')
except FileNotFoundError as e:
    print(f"Error loading data: {e}")
    exit()

# --- Part 1: Update combined_courses.csv ---

# Add duration column
def get_duration(row):
    # Check if the course title exists in Coursera or Udemy datasets
    if row['title'] in coursera_df['Course Name'].values or row['title'] in udemy_df['course_title'].values:
        return 1
    else:
        return 4

combined_courses_df['duration'] = combined_courses_df.apply(get_duration, axis=1)

# Handle ratings
def convert_rating(rating):
    if rating == 't': # Assuming 't' for True
        return np.random.uniform(4.0, 5.0)
    elif rating == 'f': # Assuming 'f' for False
        return np.random.uniform(1.0, 3.0)
    try:
        return float(rating)
    except (ValueError, TypeError):
        return np.random.uniform(1.0, 3.0) # Default for non-numeric/boolean ratings

combined_courses_df['rating'] = combined_courses_df['rating'].apply(convert_rating)


# --- Part 2: Combine datasets ---

# Rename columns for consistency
combined_courses_df.rename(columns={'title': 'course_name'}, inplace=True)

# Merge the dataframes
# We'll use an outer merge to keep all courses from both dataframes
final_courses_df = pd.merge(combined_courses_df, courses_df, on='course_name', how='outer')

# Fill in missing values from either dataframe
final_courses_df['description_x'].fillna(final_courses_df['description_y'], inplace=True)
final_courses_df.rename(columns={'description_x': 'description'}, inplace=True)
final_courses_df.drop(columns=['description_y'], inplace=True)


# --- Part 3: Save and show the result ---
final_courses_df.to_csv('data/final_courses.csv', index=False)

print("Processing complete. New dataset saved to 'data/final_courses.csv'")
print("Here's a preview of the new dataset:")
print(final_courses_df.head())
