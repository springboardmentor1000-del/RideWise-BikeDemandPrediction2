# -*- coding: utf-8 -*-
"""
XGBoost Model Training & Pickle File Creation
For Day and Hour Datasets
"""

from google.colab import drive
drive.mount('/content/drive')

import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from xgboost import XGBRegressor

import warnings
warnings.filterwarnings('ignore')

print("="*80)
print(" "*20 + "XGBOOST MODEL TRAINING & PICKLING")
print("="*80)

# ============================================================================
# PART 1: DAY DATASET - FEATURE ENGINEERING & MODELING
# ============================================================================

print("\n" + "="*80)
print("DAY DATASET PROCESSING")
print("="*80)

# Load data
day_df = pd.read_csv("/content/drive/MyDrive/day.csv")
print(f"\n✓ Loaded day.csv: {day_df.shape}")

# Feature Engineering
day_df['dteday'] = pd.to_datetime(day_df['dteday'])
day_df['year'] = day_df['dteday'].dt.year
day_df['month'] = day_df['dteday'].dt.month
day_df['day'] = day_df['dteday'].dt.day
day_df['is_weekend'] = day_df['weekday'].apply(lambda x: 1 if x in [5, 6] else 0)
day_df['weather_index'] = (day_df['temp'] + day_df['hum'] + day_df['windspeed'])

print("\n✓ Feature Engineering Applied:")
print("  - year, month, day extracted")
print("  - is_weekend created")
print("  - weather_index created")

# Separate features and target BEFORE dropping columns
# This is important for proper feature engineering
X_day = day_df.drop(columns=['cnt', 'casual', 'registered', 'dteday', 'instant'])
y_day = day_df['cnt']

print(f"\n✓ Features shape: {X_day.shape}")
print(f"✓ Target shape: {y_day.shape}")
print(f"\nFeatures used: {list(X_day.columns)}")

# Train-test split
X_day_train, X_day_test, y_day_train, y_day_test = train_test_split(
    X_day, y_day, test_size=0.2, random_state=42, shuffle=True
)

print(f"\n✓ Train-Test Split:")
print(f"  Training: {X_day_train.shape[0]} samples")
print(f"  Testing: {X_day_test.shape[0]} samples")

# XGBoost Model for Day Dataset
print("\n" + "-"*80)
print("TRAINING XGBOOST MODEL - DAY DATASET")
print("-"*80)

xgb_day = XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective='reg:squarederror',
    random_state=42,
    n_jobs=-1
)

print("\nTraining XGBoost...", end='', flush=True)
xgb_day.fit(X_day_train, y_day_train)
print(" ✓")

# Predictions
y_day_train_pred = xgb_day.predict(X_day_train)
y_day_test_pred = xgb_day.predict(X_day_test)

# Evaluation
train_r2_day = r2_score(y_day_train, y_day_train_pred)
test_r2_day = r2_score(y_day_test, y_day_test_pred)
train_rmse_day = np.sqrt(mean_squared_error(y_day_train, y_day_train_pred))
test_rmse_day = np.sqrt(mean_squared_error(y_day_test, y_day_test_pred))
test_mae_day = mean_absolute_error(y_day_test, y_day_test_pred)

# Cross-validation
print("Running cross-validation...", end='', flush=True)
cv_scores_day = cross_val_score(xgb_day, X_day_train, y_day_train, 
                                 cv=5, scoring='r2', n_jobs=-1)
print(" ✓")

print("\n" + "="*80)
print("DAY DATASET RESULTS")
print("="*80)
print(f"Train R² Score: {train_r2_day:.4f}")
print(f"Test R² Score:  {test_r2_day:.4f}")
print(f"Train RMSE:     {train_rmse_day:.2f}")
print(f"Test RMSE:      {test_rmse_day:.2f}")
print(f"Test MAE:       {test_mae_day:.2f}")
print(f"CV R² Mean:     {cv_scores_day.mean():.4f} ± {cv_scores_day.std():.4f}")
print(f"Overfit Gap:    {(train_r2_day - test_r2_day):.4f}")

# ============================================================================
# PART 2: HOUR DATASET - FEATURE ENGINEERING & MODELING
# ============================================================================

print("\n" + "="*80)
print("HOUR DATASET PROCESSING")
print("="*80)

# Load data
hour_df = pd.read_csv("/content/drive/MyDrive/hour.csv")
print(f"\n✓ Loaded hour.csv: {hour_df.shape}")

# Feature Engineering
hour_df['dteday'] = pd.to_datetime(hour_df['dteday'])
hour_df['year'] = hour_df['dteday'].dt.year
hour_df['month'] = hour_df['dteday'].dt.month
hour_df['is_weekend'] = hour_df['weekday'].apply(lambda x: 1 if x in [5, 6] else 0)
hour_df['is_peak_hour'] = hour_df['hr'].apply(lambda x: 1 if x in [7, 8, 17, 18] else 0)
hour_df['weather_index'] = hour_df['temp'] + hour_df['hum'] + hour_df['windspeed']

print("\n✓ Feature Engineering Applied:")
print("  - year, month extracted")
print("  - is_weekend created")
print("  - is_peak_hour created")
print("  - weather_index created")

# Separate features and target
X_hour = hour_df.drop(columns=['cnt', 'casual', 'registered', 'dteday', 'instant'])
y_hour = hour_df['cnt']

print(f"\n✓ Features shape: {X_hour.shape}")
print(f"✓ Target shape: {y_hour.shape}")

# Train-test split
X_hour_train, X_hour_test, y_hour_train, y_hour_test = train_test_split(
    X_hour, y_hour, test_size=0.2, random_state=42, shuffle=True
)

print(f"\n✓ Train-Test Split:")
print(f"  Training: {X_hour_train.shape[0]} samples")
print(f"  Testing: {X_hour_test.shape[0]} samples")

# XGBoost Model for Hour Dataset
print("\n" + "-"*80)
print("TRAINING XGBOOST MODEL - HOUR DATASET")
print("-"*80)

xgb_hour = XGBRegressor(
    n_estimators=300,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective='reg:squarederror',
    random_state=42,
    n_jobs=-1
)

print("\nTraining XGBoost...", end='', flush=True)
xgb_hour.fit(X_hour_train, y_hour_train)
print(" ✓")

# Predictions
y_hour_train_pred = xgb_hour.predict(X_hour_train)
y_hour_test_pred = xgb_hour.predict(X_hour_test)

# Evaluation
train_r2_hour = r2_score(y_hour_train, y_hour_train_pred)
test_r2_hour = r2_score(y_hour_test, y_hour_test_pred)
train_rmse_hour = np.sqrt(mean_squared_error(y_hour_train, y_hour_train_pred))
test_rmse_hour = np.sqrt(mean_squared_error(y_hour_test, y_hour_test_pred))
test_mae_hour = mean_absolute_error(y_hour_test, y_hour_test_pred)

# Cross-validation
print("Running cross-validation...", end='', flush=True)
cv_scores_hour = cross_val_score(xgb_hour, X_hour_train, y_hour_train, 
                                  cv=5, scoring='r2', n_jobs=-1)
print(" ✓")

print("\n" + "="*80)
print("HOUR DATASET RESULTS")
print("="*80)
print(f"Train R² Score: {train_r2_hour:.4f}")
print(f"Test R² Score:  {test_r2_hour:.4f}")
print(f"Train RMSE:     {train_rmse_hour:.2f}")
print(f"Test RMSE:      {test_rmse_hour:.2f}")
print(f"Test MAE:       {test_mae_hour:.2f}")
print(f"CV R² Mean:     {cv_scores_hour.mean():.4f} ± {cv_scores_hour.std():.4f}")
print(f"Overfit Gap:    {(train_r2_hour - test_r2_hour):.4f}")

# ============================================================================
# PART 3: SAVE PICKLE FILES
# ============================================================================

print("\n" + "="*80)
print("SAVING PICKLE FILES")
print("="*80)

# Create dictionary with all important objects for DAY dataset
day_pickle_data = {
    'model': xgb_day,
    'X_train': X_day_train,
    'X_test': X_day_test,
    'y_train': y_day_train,
    'y_test': y_day_test,
    'y_train_pred': y_day_train_pred,
    'y_test_pred': y_day_test_pred,
    'feature_names': list(X_day.columns),
    'metrics': {
        'train_r2': train_r2_day,
        'test_r2': test_r2_day,
        'train_rmse': train_rmse_day,
        'test_rmse': test_rmse_day,
        'test_mae': test_mae_day,
        'cv_r2_mean': cv_scores_day.mean(),
        'cv_r2_std': cv_scores_day.std()
    }
}

# Save DAY pickle file
with open('/content/drive/MyDrive/xgb_day_model.pkl', 'wb') as f:
    pickle.dump(day_pickle_data, f)
print("\n✓ Saved: xgb_day_model.pkl")

# Create dictionary with all important objects for HOUR dataset
hour_pickle_data = {
    'model': xgb_hour,
    'X_train': X_hour_train,
    'X_test': X_hour_test,
    'y_train': y_hour_train,
    'y_test': y_hour_test,
    'y_train_pred': y_hour_train_pred,
    'y_test_pred': y_hour_test_pred,
    'feature_names': list(X_hour.columns),
    'metrics': {
        'train_r2': train_r2_hour,
        'test_r2': test_r2_hour,
        'train_rmse': train_rmse_hour,
        'test_rmse': test_rmse_hour,
        'test_mae': test_mae_hour,
        'cv_r2_mean': cv_scores_hour.mean(),
        'cv_r2_std': cv_scores_hour.std()
    }
}

# Save HOUR pickle file
with open('/content/drive/MyDrive/xgb_hour_model.pkl', 'wb') as f:
    pickle.dump(hour_pickle_data, f)
print("✓ Saved: xgb_hour_model.pkl")

# Also save just the models (lighter files)
with open('/content/drive/MyDrive/xgb_day_model_only.pkl', 'wb') as f:
    pickle.dump(xgb_day, f)
print("✓ Saved: xgb_day_model_only.pkl")

with open('/content/drive/MyDrive/xgb_hour_model_only.pkl', 'wb') as f:
    pickle.dump(xgb_hour, f)
print("✓ Saved: xgb_hour_model_only.pkl")

print("\n" + "="*80)
print("PICKLE FILES CREATED SUCCESSFULLY!")
print("="*80)
print("\nFiles saved:")
print("1. xgb_day_model.pkl       - Complete day dataset (model + data + metrics)")
print("2. xgb_hour_model.pkl      - Complete hour dataset (model + data + metrics)")
print("3. xgb_day_model_only.pkl  - Day model only (lightweight)")
print("4. xgb_hour_model_only.pkl - Hour model only (lightweight)")

# ============================================================================
# PART 4: VISUALIZATIONS
# ============================================================================

print("\n" + "="*80)
print("GENERATING VISUALIZATIONS")
print("="*80)

# Figure 1: Model Performance Comparison
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Day Dataset
datasets = ['Day', 'Hour']
train_r2 = [train_r2_day, train_r2_hour]
test_r2 = [test_r2_day, test_r2_hour]

x = np.arange(len(datasets))
width = 0.35

axes[0].bar(x - width/2, train_r2, width, label='Train R²', alpha=0.8, color='skyblue')
axes[0].bar(x + width/2, test_r2, width, label='Test R²', alpha=0.8, color='coral')
axes[0].set_ylabel('R² Score', fontsize=11)
axes[0].set_title('XGBoost Model Performance', fontsize=12, fontweight='bold')
axes[0].set_xticks(x)
axes[0].set_xticklabels(datasets)
axes[0].legend()
axes[0].grid(axis='y', alpha=0.3)
axes[0].set_ylim([0, 1])

# RMSE Comparison
rmse_values = [test_rmse_day, test_rmse_hour]
axes[1].bar(datasets, rmse_values, color=['indianred', 'darkorange'], alpha=0.7, edgecolor='black')
axes[1].set_ylabel('RMSE', fontsize=11)
axes[1].set_title('Test RMSE Comparison', fontsize=12, fontweight='bold')
axes[1].grid(axis='y', alpha=0.3)

for i, v in enumerate(rmse_values):
    axes[1].text(i, v + max(rmse_values)*0.02, f'{v:.2f}', 
                ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('/content/drive/MyDrive/xgb_performance_comparison.png', dpi=300, bbox_inches='tight')
plt.show()

# Figure 2: Actual vs Predicted for Both Datasets
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Day Dataset
axes[0].scatter(y_day_test, y_day_test_pred, alpha=0.6, s=30, edgecolors='k', linewidth=0.5)
axes[0].plot([y_day_test.min(), y_day_test.max()], 
            [y_day_test.min(), y_day_test.max()], 
            'r--', lw=2, label='Perfect Prediction')
axes[0].set_xlabel('Actual Rentals', fontsize=11)
axes[0].set_ylabel('Predicted Rentals', fontsize=11)
axes[0].set_title(f'Day Dataset (R²={test_r2_day:.4f})', fontsize=12, fontweight='bold')
axes[0].legend()
axes[0].grid(alpha=0.3)

# Hour Dataset
axes[1].scatter(y_hour_test, y_hour_test_pred, alpha=0.5, s=10, edgecolors='none')
axes[1].plot([y_hour_test.min(), y_hour_test.max()], 
            [y_hour_test.min(), y_hour_test.max()], 
            'r--', lw=2, label='Perfect Prediction')
axes[1].set_xlabel('Actual Rentals', fontsize=11)
axes[1].set_ylabel('Predicted Rentals', fontsize=11)
axes[1].set_title(f'Hour Dataset (R²={test_r2_hour:.4f})', fontsize=12, fontweight='bold')
axes[1].legend()
axes[1].grid(alpha=0.3)

plt.tight_layout()
plt.savefig('/content/drive/MyDrive/xgb_actual_vs_predicted.png', dpi=300, bbox_inches='tight')
plt.show()

# Figure 3: Feature Importance
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

# Day Dataset Feature Importance
day_importance = pd.DataFrame({
    'Feature': X_day.columns,
    'Importance': xgb_day.feature_importances_
}).sort_values('Importance', ascending=False).head(15)

axes[0].barh(range(len(day_importance)), day_importance['Importance'], color='steelblue')
axes[0].set_yticks(range(len(day_importance)))
axes[0].set_yticklabels(day_importance['Feature'])
axes[0].set_xlabel('Importance', fontsize=11)
axes[0].set_title('Day Dataset - Top 15 Features', fontsize=12, fontweight='bold')
axes[0].invert_yaxis()
axes[0].grid(axis='x', alpha=0.3)

# Hour Dataset Feature Importance
hour_importance = pd.DataFrame({
    'Feature': X_hour.columns,
    'Importance': xgb_hour.feature_importances_
}).sort_values('Importance', ascending=False).head(15)

axes[1].barh(range(len(hour_importance)), hour_importance['Importance'], color='coral')
axes[1].set_yticks(range(len(hour_importance)))
axes[1].set_yticklabels(hour_importance['Feature'])
axes[1].set_xlabel('Importance', fontsize=11)
axes[1].set_title('Hour Dataset - Top 15 Features', fontsize=12, fontweight='bold')
axes[1].invert_yaxis()
axes[1].grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.savefig('/content/drive/MyDrive/xgb_feature_importance.png', dpi=300, bbox_inches='tight')
plt.show()

print("\n✓ All visualizations saved!")

# ============================================================================
# PART 5: SUMMARY
# ============================================================================

print("\n" + "="*80)
print(" "*25 + "FINAL SUMMARY")
print("="*80)

summary_df = pd.DataFrame({
    'Dataset': ['Day', 'Hour'],
    'Test R²': [f"{test_r2_day:.4f}", f"{test_r2_hour:.4f}"],
    'Test RMSE': [f"{test_rmse_day:.2f}", f"{test_rmse_hour:.2f}"],
    'Test MAE': [f"{test_mae_day:.2f}", f"{test_mae_hour:.2f}"],
    'CV R² Mean': [f"{cv_scores_day.mean():.4f}", f"{cv_scores_hour.mean():.4f}"],
    'Overfit Gap': [f"{(train_r2_day - test_r2_day):.4f}", 
                    f"{(train_r2_hour - test_r2_hour):.4f}"]
})

print(summary_df.to_string(index=False))

print("\n" + "="*80)
print("✓ MODELING COMPLETE!")
print("✓ Pickle files saved to Google Drive")
print("✓ Visualizations saved to Google Drive")
print("="*80)