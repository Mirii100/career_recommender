import pandas as pd
import numpy as np

print("Processing course data...")

# Load the dataset
try:
    df = pd.read_csv('data/final_courses_v2.csv')
except FileNotFoundError as e:
    print(f"Error loading data: {e}")
    exit()

# --- Apply rating logic ---
def convert_rating(rating):
    if isinstance(rating, str):
        if rating.lower() == 'true':
            return np.random.uniform(3.0, 5.0)
        elif rating.lower() == 'false':
            return np.random.uniform(1.0, 3.0)
    try:
        return float(rating)
    except (ValueError, TypeError):
        return np.random.uniform(1.0, 3.0) # Default for non-numeric/boolean ratings

df['rating'] = df['rating'].apply(convert_rating)

# --- Select desired columns ---
final_df = df[['course_name', 'rating', 'description', 'skills_tags', 'duration']]


# --- Save and notify ---
final_df.to_csv('data/final_courses_v3.csv', index=False)

print("Processing complete. New dataset saved to 'data/final_courses_v3.csv'")
print("Here's a preview of the new dataset:")
print(final_df.head())
