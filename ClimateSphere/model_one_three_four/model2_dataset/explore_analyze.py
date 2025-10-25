# ------------------------------------------------------------
# Dynamic Climate Data Exploration and Analysis System
# Author: Krishna Marathe
# ------------------------------------------------------------

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import requests
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class ClimateDataExplorer:
    def __init__(self):
        self.api_endpoints = {
            'open_meteo': 'https://api.open-meteo.com/v1/forecast',
            'climate_data': 'https://archive-api.open-meteo.com/v1/archive'
        }
        
    def fetch_real_time_data(self, latitude=40.7128, longitude=-74.0060, days=30):
        """
        Fetch real-time climate data from Open-Meteo API
        """
        print(f"🌐 Fetching real-time climate data for coordinates ({latitude}, {longitude})...")
        
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # API parameters
            params = {
                'latitude': latitude,
                'longitude': longitude,
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m,wind_speed_10m_max',
                'timezone': 'UTC'
            }
            
            # Make API request
            response = requests.get(self.api_endpoints['climate_data'], params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Convert to DataFrame
                daily_data = data['daily']
                df = pd.DataFrame({
                    'Date': pd.to_datetime(daily_data['time']),
                    'Temperature_Max': daily_data['temperature_2m_max'],
                    'Temperature_Min': daily_data['temperature_2m_min'],
                    'Precipitation': daily_data['precipitation_sum'],
                    'Humidity': daily_data['relative_humidity_2m'],
                    'Wind_Speed': daily_data['wind_speed_10m_max']
                })
                
                # Calculate average temperature
                df['Temperature_C'] = (df['Temperature_Max'] + df['Temperature_Min']) / 2
                df['Rainfall_mm'] = df['Precipitation']
                df['Humidity_%'] = df['Humidity']
                df['Wind_Speed_mps'] = df['Wind_Speed']
                
                # Add synthetic features for modeling
                df['CO2_ppm'] = np.random.normal(420, 10, len(df))
                df['Soil_Moisture'] = np.random.uniform(20, 80, len(df))
                df['Evaporation_mm_day'] = np.random.uniform(2, 8, len(df))
                
                print(f"✅ Successfully fetched {len(df)} days of real-time data")
                return df
                
            else:
                print(f"❌ API request failed with status code: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            return None
        except Exception as e:
            print(f"❌ Error fetching real-time data: {e}")
            return None
    
    def analyze_data_quality(self, df):
        """
        Comprehensive data quality analysis
        """
        print("🔍 Analyzing data quality...")
        
        quality_report = {
            'total_records': len(df),
            'total_features': len(df.columns),
            'missing_values': {},
            'data_types': {},
            'outliers': {},
            'duplicates': df.duplicated().sum()
        }
        
        # Missing values analysis
        for col in df.columns:
            missing_count = df[col].isnull().sum()
            missing_pct = (missing_count / len(df)) * 100
            quality_report['missing_values'][col] = {
                'count': missing_count,
                'percentage': round(missing_pct, 2)
            }
        
        # Data types
        for col in df.columns:
            quality_report['data_types'][col] = str(df[col].dtype)
        
        # Outliers detection (for numeric columns)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
            quality_report['outliers'][col] = len(outliers)
        
        return quality_report
    
    def generate_statistical_summary(self, df):
        """
        Generate comprehensive statistical summary
        """
        print("📊 Generating statistical summary...")
        
        # Basic statistics
        numeric_df = df.select_dtypes(include=[np.number])
        stats_summary = numeric_df.describe()
        
        # Additional statistics
        additional_stats = pd.DataFrame({
            'skewness': numeric_df.skew(),
            'kurtosis': numeric_df.kurtosis(),
            'variance': numeric_df.var()
        })
        
        return stats_summary, additional_stats
    
    def analyze_correlations(self, df):
        """
        Analyze feature correlations
        """
        print("🔗 Analyzing feature correlations...")
        
        numeric_df = df.select_dtypes(include=[np.number])
        correlation_matrix = numeric_df.corr()
        
        # Find strong correlations
        strong_correlations = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_val = correlation_matrix.iloc[i, j]
                if abs(corr_val) > 0.7:
                    strong_correlations.append({
                        'feature1': correlation_matrix.columns[i],
                        'feature2': correlation_matrix.columns[j],
                        'correlation': round(corr_val, 3)
                    })
        
        return correlation_matrix, strong_correlations
    
    def detect_trends(self, df):
        """
        Detect temporal trends in climate data
        """
        print("📈 Detecting climate trends...")
        
        trends = {}
        
        # If we have date information
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values('Date')
            
            # Analyze trends for key climate variables
            climate_vars = ['Temperature_C', 'Rainfall_mm', 'Humidity_%', 'CO2_ppm']
            
            for var in climate_vars:
                if var in df.columns:
                    # Simple linear trend
                    x = np.arange(len(df))
                    y = df[var].values
                    
                    # Remove NaN values
                    mask = ~np.isnan(y)
                    if mask.sum() > 1:
                        slope = np.polyfit(x[mask], y[mask], 1)[0]
                        trends[var] = {
                            'slope': round(slope, 6),
                            'direction': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable',
                            'magnitude': 'strong' if abs(slope) > np.std(y) * 0.1 else 'weak'
                        }
        
        return trends
    
    def create_visualizations(self, df, save_plots=True):
        """
        Create comprehensive visualizations
        """
        print("🎨 Creating visualizations...")
        
        # Set style
        plt.style.use('seaborn-v0_8')
        
        # 1. Correlation heatmap
        plt.figure(figsize=(12, 8))
        numeric_df = df.select_dtypes(include=[np.number])
        correlation_matrix = numeric_df.corr()
        
        mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
        sns.heatmap(correlation_matrix, mask=mask, annot=True, cmap='RdYlBu_r', 
                    center=0, square=True, fmt='.2f', cbar_kws={"shrink": .8})
        plt.title('Climate Variables Correlation Matrix', fontsize=16, fontweight='bold')
        plt.tight_layout()
        
        if save_plots:
            plt.savefig('correlation_heatmap.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # 2. Distribution plots
        climate_vars = ['Temperature_C', 'Rainfall_mm', 'Humidity_%', 'CO2_ppm']
        existing_vars = [var for var in climate_vars if var in df.columns]
        
        if existing_vars:
            fig, axes = plt.subplots(2, 2, figsize=(15, 10))
            axes = axes.flatten()
            
            for i, var in enumerate(existing_vars[:4]):
                if i < len(axes):
                    axes[i].hist(df[var].dropna(), bins=30, alpha=0.7, color='skyblue', edgecolor='black')
                    axes[i].set_title(f'{var} Distribution', fontweight='bold')
                    axes[i].set_xlabel(var)
                    axes[i].set_ylabel('Frequency')
                    axes[i].grid(True, alpha=0.3)
            
            plt.tight_layout()
            if save_plots:
                plt.savefig('variable_distributions.png', dpi=300, bbox_inches='tight')
            plt.show()
        
        # 3. Time series plot (if date column exists)
        if 'Date' in df.columns and 'Temperature_C' in df.columns:
            plt.figure(figsize=(12, 6))
            plt.plot(df['Date'], df['Temperature_C'], linewidth=2, color='red', alpha=0.7)
            plt.title('Temperature Trend Over Time', fontsize=16, fontweight='bold')
            plt.xlabel('Date')
            plt.ylabel('Temperature (°C)')
            plt.grid(True, alpha=0.3)
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            if save_plots:
                plt.savefig('temperature_trend.png', dpi=300, bbox_inches='tight')
            plt.show()
    
    def generate_insights(self, df, quality_report, trends):
        """
        Generate intelligent insights from the data
        """
        print("💡 Generating intelligent insights...")
        
        insights = []
        
        # Data quality insights
        if quality_report['duplicates'] > 0:
            insights.append(f"⚠️ Found {quality_report['duplicates']} duplicate records that should be removed")
        
        missing_issues = [col for col, info in quality_report['missing_values'].items() 
                         if info['percentage'] > 10]
        if missing_issues:
            insights.append(f"🔍 High missing values detected in: {', '.join(missing_issues)}")
        
        # Trend insights
        for var, trend_info in trends.items():
            if trend_info['magnitude'] == 'strong':
                insights.append(f"📈 Strong {trend_info['direction']} trend detected in {var}")
        
        # Climate-specific insights
        if 'Temperature_C' in df.columns:
            avg_temp = df['Temperature_C'].mean()
            if avg_temp > 30:
                insights.append("🌡️ High average temperatures detected - increased heatwave risk")
            elif avg_temp < 10:
                insights.append("❄️ Low average temperatures detected - potential cold stress conditions")
        
        if 'Rainfall_mm' in df.columns:
            avg_rain = df['Rainfall_mm'].mean()
            if avg_rain > 200:
                insights.append("🌧️ High rainfall levels detected - increased flood risk")
            elif avg_rain < 50:
                insights.append("🏜️ Low rainfall levels detected - increased drought risk")
        
        return insights
    
    def comprehensive_analysis(self, df=None, fetch_real_time=False, coordinates=(40.7128, -74.0060)):
        """
        Perform comprehensive climate data analysis
        """
        print("🚀 Starting comprehensive climate data analysis...")
        
        # Get data
        if fetch_real_time:
            df = self.fetch_real_time_data(coordinates[0], coordinates[1])
            if df is None:
                print("⚠️ Falling back to provided data or synthetic data")
        
        if df is None:
            print("📝 No data provided, creating synthetic data for demonstration")
            df = pd.DataFrame({
                'Date': pd.date_range('2023-01-01', periods=365, freq='D'),
                'Temperature_C': np.random.normal(25, 5, 365),
                'Rainfall_mm': np.random.exponential(3, 365),
                'Humidity_%': np.random.normal(60, 15, 365),
                'CO2_ppm': np.random.normal(420, 10, 365)
            })
        
        # Perform analysis
        quality_report = self.analyze_data_quality(df)
        stats_summary, additional_stats = self.generate_statistical_summary(df)
        correlation_matrix, strong_correlations = self.analyze_correlations(df)
        trends = self.detect_trends(df)
        insights = self.generate_insights(df, quality_report, trends)
        
        # Create visualizations
        self.create_visualizations(df)
        
        # Print comprehensive report
        print("\n" + "="*60)
        print("📊 COMPREHENSIVE CLIMATE DATA ANALYSIS REPORT")
        print("="*60)
        
        print(f"\n📈 Dataset Overview:")
        print(f"   Records: {quality_report['total_records']}")
        print(f"   Features: {quality_report['total_features']}")
        print(f"   Duplicates: {quality_report['duplicates']}")
        
        print(f"\n🔗 Strong Correlations (|r| > 0.7):")
        for corr in strong_correlations:
            print(f"   {corr['feature1']} ↔ {corr['feature2']}: {corr['correlation']}")
        
        print(f"\n📈 Detected Trends:")
        for var, trend in trends.items():
            print(f"   {var}: {trend['direction']} ({trend['magnitude']})")
        
        print(f"\n💡 Key Insights:")
        for insight in insights:
            print(f"   {insight}")
        
        print("\n✅ Analysis completed successfully!")
        
        return {
            'data': df,
            'quality_report': quality_report,
            'statistics': stats_summary,
            'correlations': correlation_matrix,
            'trends': trends,
            'insights': insights
        }

if __name__ == "__main__":
    explorer = ClimateDataExplorer()
    
    # Test with real-time data fetch
    print("🧪 Testing climate data exploration...")
    results = explorer.comprehensive_analysis(fetch_real_time=True)
    
    print("✅ Climate data exploration test completed!")