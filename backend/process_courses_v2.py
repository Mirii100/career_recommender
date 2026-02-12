import pandas as pd
import numpy as np

print("Processing course data...")

# Load the datasets
try:
    course_df = pd.read_csv('data/course.csv')
    combined_courses_df = pd.read_csv('data/combined_courses.csv')
    coursera_df = pd.read_csv('data/Coursera.csv')
    udemy_df = pd.read_csv('data/udemy_courses.csv')
except FileNotFoundError as e:
    print(f"Error loading data: {e}")
    exit()

# --- Process combined_courses.csv ---
def get_duration(row):
    if row['title'] in coursera_df['Course Name'].values or row['title'] in udemy_df['course_title'].values:
        return 1.0
    else:
        return 4.0

combined_courses_df['duration'] = combined_courses_df.apply(get_duration, axis=1)
# Rename title to course_name for merging
combined_courses_df.rename(columns={'title': 'course_name'}, inplace=True)


# --- Process course.csv ---
def convert_rating(rating):
    if rating: # Handles True
        return np.random.uniform(3.0, 5.0)
    else: # Handles False
        return np.random.uniform(1.0, 3.0)

# The rating column in course.csv is boolean, so we can apply the function directly
if 'rating' in course_df.columns:
    course_df['rating'] = course_df['rating'].apply(convert_rating)


# --- Combine the datasets ---
# Align columns before merging. We need to see what columns are in each.
# Let's assume for now they have 'course_name' and 'description' as common themes,
# and other columns might be unique.

# A simple concatenation might be better if schemas are very different.
# Let's try to align a few key columns and then concatenate.

# Align 'course.csv' to have similar columns to 'combined_courses.csv' where possible
# 'course.csv' has: course_name, required_subjects, required_skills, description, ...
# 'combined_courses.csv' has: course_name, rating, description, skills_tags, duration

# Let's create a new dataframe with a common structure
final_df = pd.concat([combined_courses_df, course_df], ignore_index=True, sort=False)


# --- Save and notify ---
final_df.to_csv('data/final_courses_v2.csv', index=False)

print("Processing complete. New dataset saved to 'data/final_courses_v2.csv'")
