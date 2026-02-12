import pandas as pd
import numpy as np

print("Processing course data...")

# Load the dataset
try:
    df = pd.read_csv('data/final_courses_v3.csv')
    coursera_df = pd.read_csv('data/Coursera.csv')
    udemy_df = pd.read_csv('data/udemy_courses.csv')
except FileNotFoundError as e:
    print(f"Error loading data: {e}")
    exit()

# --- Impute Missing Durations ---
def impute_duration(row):
    if pd.notna(row['duration']):
        return row['duration']
    
    # Infer from course name
    if 'bachelor' in row['course_name'].lower() or 'degree' in row['course_name'].lower():
        return np.random.choice([4, 5])
    if 'diploma' in row['course_name'].lower():
        return 3
    if 'certificate' in row['course_name'].lower():
        return 2
        
    # Check if the course title exists in Coursera or Udemy datasets
    if row['course_name'] in coursera_df['Course Name'].values or row['course_name'] in udemy_df['course_title'].values:
        return 1.0
    
    # Default for courses from course.csv
    return 4.0

df['duration'] = df.apply(impute_duration, axis=1)


# --- Impute Missing Ratings ---
# Calculate the mean of the existing ratings
mean_rating = df['rating'].mean()
df['rating'].fillna(mean_rating, inplace=True)


# --- Save and notify ---
df.to_csv('data/final_courses_v4.csv', index=False)

print("Processing complete. New dataset saved to 'data/final_courses_v4.csv'")
print("Here's a preview of the new dataset:")
print(df.head())
print("\nMissing values filled as follows:")
print(df.isnull().sum())
