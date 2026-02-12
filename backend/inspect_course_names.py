import pandas as pd

try:
    courses_df = pd.read_csv("backend/data/final_courses_cleaned.csv")
    course_meta_df = pd.read_csv("backend/data/courses_jobApplicability_future_trends_automation_risk.csv")

    print("Unique course names in final_courses_cleaned.csv:")
    print(courses_df['course_name'].unique())

    print("\nUnique course names in courses_jobApplicability_future_trends_automation_risk.csv:")
    print(course_meta_df['course_name'].unique())

except FileNotFoundError as e:
    print(f"Error: {e}. Make sure the files exist in the 'backend/data/' directory.")
except KeyError as e:
    print(f"Error: Missing expected column in one of the files: {e}")
