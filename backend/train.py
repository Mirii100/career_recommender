import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from app.custom_transformers import MLBWrapper
import joblib
import json

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from app.custom_transformers import MLBWrapper
import joblib
import json
import xgboost as xgb
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from sklearn.preprocessing import LabelEncoder, StandardScaler

print("Starting model training process...")

# --- 1. Load Data ---
# Course recommendation data
course_data_path = './data/synthetic_student_data.csv'
course_df = pd.read_csv(course_data_path)

# Career recommendation data
career_data_path = './data/cleaned_dataset.csv'
career_df = pd.read_csv(career_data_path)

# Clean 'Job profession' column in career_df
career_df['Job profession'] = career_df['Job profession'].apply(lambda x: x.strip())

# --- 2. Feature Engineering (Course Recommendation) ---

# Define grade to points mapping
grade_points = {
    'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
    'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'E': 1
}

grade_columns = ['Mathematics', 'Kiswahili', 'English', 'Arabic', 'German', 'French', 'Chemistry', 'Physics', 'Biology', 'Home Science', 'Agriculture', 'Computer Studies', 'History', 'Geography', 'Religious Education', 'Life Skills', 'Business Studies', 'Music', 'Art and Design', 'Drawing and Design', 'Building Construction', 'Power and Mechanics', 'Metalwork', 'Aviation', 'Woodwork', 'Electronics']

# Convert grades to points
for col in grade_columns:
    course_df[col] = course_df[col].map(grade_points)

# Handle interests and skills (convert comma-separated strings to lists)
def split_str(s):
    return [item.strip() for item in s.split(',')] if isinstance(s, str) else []

course_df['interests'] = course_df['interests'].apply(split_str)
course_df['skills'] = course_df['skills'].apply(split_str)

# --- 3. Prepare for Training (Course Recommendation) ---

# Define features (X) and target (y)
X_course = course_df[grade_columns + ['interests', 'skills']]
y_course = course_df['target_course_id'] - 1 # Adjust target to be 0-indexed for XGBoost

# Split data
X_course_train, X_course_test, y_course_train, y_course_test = train_test_split(X_course, y_course, test_size=0.2, random_state=42, stratify=y_course)

# --- 4. Prepare for Training (Career Recommendation) ---

# Define features (X_career) and target (y_career)
# Numerical features from cleaned_dataset.csv
numerical_career_cols = ['Linguistic', 'Musical', 'Bodily', 'Logical - Mathematical', 'Spatial-Visualization', 'Interpersonal', 'Intrapersonal', 'Naturalist']
# Ordinal features (already mapped to numerical in cleaning script)
ordinal_career_cols = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']

X_career = career_df[numerical_career_cols + ordinal_career_cols]
y_career = career_df['Job profession']

# Label Encode the `Job profession` target variable
career_label_encoder = LabelEncoder()
y_career_encoded = career_label_encoder.fit_transform(y_career)

# Split data
X_career_train, X_career_test, y_career_train, y_career_test = train_test_split(X_career, y_career_encoded, test_size=0.2, random_state=42, stratify=y_career_encoded)

# --- 5. Create Preprocessing and Modeling Pipelines ---

# Course Recommendation Preprocessor
course_preprocessor = ColumnTransformer(
    transformers=[
        ('grades', 'passthrough', grade_columns),
        ('interests_bin', MLBWrapper(), 'interests'),
        ('skills_bin', MLBWrapper(), 'skills')
    ],
    remainder='drop'
)

# --- Course Recommendation Pipelines ---
rf_course_pipeline = Pipeline(steps=[
    ('preprocessor', course_preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
])

xgb_course_pipeline = Pipeline(steps=[
    ('preprocessor', course_preprocessor),
    ('classifier', xgb.XGBClassifier(objective='multi:softmax', num_class=len(y_course.unique()), eval_metric='mlogloss', n_estimators=100, random_state=42))
])

svm_course_pipeline = Pipeline(steps=[
    ('preprocessor', course_preprocessor),
    ('classifier', SVC(probability=True, kernel='rbf', C=1.0, random_state=42))
])

# Career Recommendation Preprocessor
career_preprocessor = ColumnTransformer(
    transformers=[
        ('numerical', StandardScaler(), numerical_career_cols),
        ('ordinal', 'passthrough', ordinal_career_cols)
    ],
    remainder='drop'
)

# --- Career Recommendation Pipeline (using RandomForest for now) ---
career_pipeline = Pipeline(steps=[
    ('preprocessor', career_preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
])

# --- 6. Train the Models ---
print("Training the Random Forest course model...")
rf_course_pipeline.fit(X_course_train, y_course_train)

print("Training the XGBoost course model...")
xgb_course_pipeline.fit(X_course_train, y_course_train)

print("Training the SVM course model...")
svm_course_pipeline.fit(X_course_train, y_course_train)

print("Training the Career recommendation model...")
career_pipeline.fit(X_career_train, y_career_train)

# --- 7. Evaluate the Models ---

# Random Forest Course Evaluation
rf_course_predictions = rf_course_pipeline.predict(X_course_test)
rf_course_accuracy = accuracy_score(y_course_test, rf_course_predictions)
rf_course_precision = precision_score(y_course_test, rf_course_predictions, average='weighted', zero_division=0)
rf_course_recall = recall_score(y_course_test, rf_course_predictions, average='weighted', zero_division=0)
rf_course_f1 = f1_score(y_course_test, rf_course_predictions, average='weighted', zero_division=0)
print(f"Random Forest Course - Accuracy: {rf_course_accuracy:.2f}, Precision: {rf_course_precision:.2f}, Recall: {rf_course_recall:.2f}, F1-Score: {rf_course_f1:.2f}")

# XGBoost Course Evaluation
xgb_course_predictions = xgb_course_pipeline.predict(X_course_test)
xgb_course_accuracy = accuracy_score(y_course_test, xgb_course_predictions)
xgb_course_precision = precision_score(y_course_test, xgb_course_predictions, average='weighted', zero_division=0)
xgb_course_recall = recall_score(y_course_test, xgb_course_predictions, average='weighted', zero_division=0)
xgb_course_f1 = f1_score(y_course_test, xgb_course_predictions, average='weighted', zero_division=0)
print(f"XGBoost Course - Accuracy: {xgb_course_accuracy:.2f}, Precision: {xgb_course_precision:.2f}, Recall: {xgb_course_recall:.2f}, F1-Score: {xgb_course_f1:.2f}")

# SVM Course Evaluation
svm_course_predictions = svm_course_pipeline.predict(X_course_test)
svm_course_accuracy = accuracy_score(y_course_test, svm_course_predictions)
svm_course_precision = precision_score(y_course_test, svm_course_predictions, average='weighted', zero_division=0)
svm_course_recall = recall_score(y_course_test, svm_course_predictions, average='weighted', zero_division=0)
svm_course_f1 = f1_score(y_course_test, svm_course_predictions, average='weighted', zero_division=0)
print(f"SVM Course - Accuracy: {svm_course_accuracy:.2f}, Precision: {svm_course_precision:.2f}, Recall: {svm_course_recall:.2f}, F1-Score: {svm_course_f1:.2f}")

# Career Recommendation Evaluation
career_predictions = career_pipeline.predict(X_career_test)
career_accuracy = accuracy_score(y_career_test, career_predictions)
career_precision = precision_score(y_career_test, career_predictions, average='weighted', zero_division=0)
career_recall = recall_score(y_career_test, career_predictions, average='weighted', zero_division=0)
career_f1 = f1_score(y_career_test, career_predictions, average='weighted', zero_division=0)
print(f"Career Recommendation - Accuracy: {career_accuracy:.2f}, Precision: {career_precision:.2f}, Recall: {career_recall:.2f}, F1-Score: {career_f1:.2f}")

# --- 8. Save Metrics and Models to Database ---

# Import database session and model
from app.database import SessionLocal
from app.models import ModelMetric

# Create a new database session
db = SessionLocal()

try:
    # Clear existing metrics to avoid stale data
    db.query(ModelMetric).delete()

    # Create and add new metric records
    rf_course_metrics = ModelMetric(
        model_name="random_forest_course",
        accuracy=rf_course_accuracy,
        precision=rf_course_precision,
        recall=rf_course_recall,
        f1_score=rf_course_f1
    )
    xgb_course_metrics = ModelMetric(
        model_name="xgboost_course",
        accuracy=xgb_course_accuracy,
        precision=xgb_course_precision,
        recall=xgb_course_recall,
        f1_score=xgb_course_f1
    )
    svm_course_metrics = ModelMetric(
        model_name="svm_course",
        accuracy=svm_course_accuracy,
        precision=svm_course_precision,
        recall=svm_course_recall,
        f1_score=svm_course_f1
    )
    career_metrics = ModelMetric(
        model_name="career_recommendation",
        accuracy=career_accuracy,
        precision=career_precision,
        recall=career_recall,
        f1_score=career_f1
    )

    db.add_all([rf_course_metrics, xgb_course_metrics, svm_course_metrics, career_metrics])
    db.commit()
    print("Model metrics successfully saved to the database.")

    # Save metrics to JSON file for Recommender class
    metrics_json = {
        "random_forest_course": {
            "accuracy": rf_course_accuracy,
            "precision": rf_course_precision,
            "recall": rf_course_recall,
            "f1_score": rf_course_f1
        },
        "xgboost_course": {
            "accuracy": xgb_course_accuracy,
            "precision": xgb_course_precision,
            "recall": xgb_course_recall,
            "f1_score": xgb_course_f1
        },
        "svm_course": {
            "accuracy": svm_course_accuracy,
            "precision": svm_course_precision,
            "recall": svm_course_recall,
            "f1_score": svm_course_f1
        },
        "career_recommendation": {
            "accuracy": career_accuracy,
            "precision": career_precision,
            "recall": career_recall,
            "f1_score": career_f1
        }
    }
    with open('./app/model_metrics.json', 'w') as f:
        json.dump(metrics_json, f, indent=4)
    print("Model metrics successfully saved to ./app/model_metrics.json")

except Exception as e:
    print(f"Error saving metrics to database: {e}")
    db.rollback()
finally:
    db.close()

# Save the Models
joblib.dump(rf_course_pipeline, './app/random_forest_course_model.joblib')
print("Random Forest course model pipeline saved to ./app/random_forest_course_model.joblib")
joblib.dump(xgb_course_pipeline, './app/xgboost_course_model.joblib')
print("XGBoost course model pipeline saved to ./app/xgboost_course_model.joblib")
joblib.dump(svm_course_pipeline, './app/svm_course_model.joblib')
print("SVM course model pipeline saved to ./app/svm_course_model.joblib")
joblib.dump(career_pipeline, './app/career_recommendation_model.joblib')
print("Career recommendation model pipeline saved to ./app/career_recommendation_model.joblib")
joblib.dump(career_label_encoder, './app/career_label_encoder.joblib')
print("Career label encoder saved to ./app/career_label_encoder.joblib")