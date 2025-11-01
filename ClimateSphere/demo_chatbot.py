#!/usr/bin/env python3
"""
ClimateSphere AI Chatbot Demo Script
Demonstrates the intelligent chatbot capabilities for farmers and disaster response teams
"""

import requests
import json
import time

API_BASE = "http://localhost:3000/api/insights/demo"

def print_separator():
    print("=" * 80)

def print_response(title, response_data):
    print(f"\n🤖 {title}")
    print("-" * 60)
    print(f"👤 User Type: {response_data.get('user_type', 'N/A')}")
    print(f"⚠️  Risk Type: {response_data.get('risk_type', 'N/A')}")
    if response_data.get('crop_type'):
        print(f"🌾 Crop Type: {response_data.get('crop_type')}")
    print(f"🎯 Confidence: {response_data.get('confidence_score', 0):.1%}")
    
    print(f"\n💬 AI Response:")
    print(response_data.get('message', 'No response'))
    
    if response_data.get('specialized_advice'):
        print(f"\n📋 Specialized Advice ({len(response_data['specialized_advice'])} items):")
        for i, advice in enumerate(response_data['specialized_advice'][:3], 1):
            print(f"   {i}. {advice}")
    
    if response_data.get('risk_predictions'):
        risk = response_data['risk_predictions']
        print(f"\n📊 Risk Assessment:")
        print(f"   • Probability: {risk['probability']:.1%}")
        print(f"   • Severity: {risk['severity']}")
        print(f"   • Timeframe: {risk['timeframe']}")

def demo_farmer_queries():
    print_separator()
    print("🌾 FARMER ASSISTANCE DEMO")
    print_separator()
    
    farmer_queries = [
        "My crop is maize and rainfall has been low - what can I do?",
        "How can I protect my rice fields from flooding?",
        "What drought-resistant crops should I consider for next season?",
        "My soil moisture is very low, when should I irrigate?"
    ]
    
    for i, query in enumerate(farmer_queries, 1):
        print(f"\n📝 Farmer Query {i}: {query}")
        
        try:
            response = requests.post(f"{API_BASE}/chat", json={"message": query})
            if response.status_code == 200:
                print_response("Farmer Assistant Response", response.json())
            else:
                print(f"❌ Error: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        time.sleep(1)  # Brief pause between requests

def demo_disaster_response():
    print_separator()
    print("🚨 DISASTER RESPONSE DEMO")
    print_separator()
    
    disaster_queries = [
        "Which districts face high flood risk this week?",
        "What's the emergency response protocol for heatwaves?",
        "How do I coordinate evacuation for coastal areas?",
        "We need to set up emergency shelters for drought-affected regions"
    ]
    
    for i, query in enumerate(disaster_queries, 1):
        print(f"\n📝 Disaster Response Query {i}: {query}")
        
        try:
            response = requests.post(f"{API_BASE}/chat", json={"message": query})
            if response.status_code == 200:
                print_response("Disaster Response Assistant", response.json())
            else:
                print(f"❌ Error: {response.status_code}")
        except Exception as e:
            print(f"❌ Request failed: {e}")
        
        time.sleep(1)

def demo_district_assessment():
    print_separator()
    print("🗺️ DISTRICT RISK ASSESSMENT DEMO")
    print_separator()
    
    risk_types = ['flood', 'drought', 'heatwave']
    
    for risk_type in risk_types:
        print(f"\n📊 {risk_type.title()} Risk Assessment:")
        
        try:
            response = requests.get(f"{API_BASE}/districts?risk_type={risk_type}&timeframe=7 days")
            if response.status_code == 200:
                data = response.json()
                print(f"   Total Districts: {data.get('total_districts')}")
                print(f"   High Risk Count: {data.get('high_risk_count')}")
                
                # Show top 3 high-risk districts
                districts = data.get('districts', [])[:3]
                print(f"   Top Risk Districts:")
                for district in districts:
                    print(f"   📍 {district['name']}, {district['state']}: {district['risk_level']} ({district['probability']:.1%})")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

def main():
    print("🌍 ClimateSphere AI Chatbot Demonstration")
    print("Powered by Google Gemini AI with specialized climate knowledge")
    print_separator()
    
    # Check if APIs are running
    try:
        health_check = requests.get("http://localhost:3000/health", timeout=5)
        if health_check.status_code == 200:
            print("✅ ClimateSphere APIs are running")
        else:
            print("❌ Backend API not responding")
            return
    except:
        print("❌ Cannot connect to ClimateSphere APIs")
        print("Please ensure the project is running: npm run dev in backend/")
        return
    
    # Run demonstrations
    demo_farmer_queries()
    demo_disaster_response()
    demo_district_assessment()
    
    print_separator()
    print("🎉 DEMONSTRATION COMPLETE!")
    print_separator()
    print("\n💡 Try the full interactive experience:")
    print("   🌐 Web Interface: http://localhost:8000/dashboard/chatbot.html")
    print("   📱 Features:")
    print("      • Switch between user types (Farmer/Disaster Response/General)")
    print("      • Quick question suggestions")
    print("      • Real-time risk indicators")
    print("      • Chat history and export")
    print("      • Mobile-responsive design")
    
    print("\n🔗 API Endpoints:")
    print("   • Chat: POST /api/insights/demo/chat")
    print("   • Districts: GET /api/insights/demo/districts")
    print("   • Generate: POST /api/insights/demo/generate")

if __name__ == "__main__":
    main()