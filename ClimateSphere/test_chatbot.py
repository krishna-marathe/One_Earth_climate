#!/usr/bin/env python3
"""
Test script for ClimateSphere AI Chatbot functionality
"""

import requests
import json

# API Configuration
API_BASE_URL = "http://localhost:3000/api"
ML_API_URL = "http://localhost:5000"

def test_api_health():
    """Test if APIs are running"""
    print("🔍 Testing API Health...")
    
    try:
        # Test backend API
        backend_response = requests.get(f"{API_BASE_URL.replace('/api', '')}/health", timeout=5)
        print(f"✅ Backend API: {backend_response.status_code}")
        
        # Test ML API
        ml_response = requests.get(f"{ML_API_URL}/health", timeout=5)
        print(f"✅ ML API: {ml_response.status_code}")
        
        return True
    except Exception as e:
        print(f"❌ API Health Check Failed: {e}")
        return False

def test_chatbot_responses():
    """Test chatbot with different user types and queries"""
    print("\n🤖 Testing Chatbot Responses...")
    
    # Test queries for different user types
    test_cases = [
        {
            "message": "My crop is maize and rainfall has been low - what can I do?",
            "expected_user_type": "farmer",
            "expected_risk_type": "drought",
            "expected_crop_type": "maize"
        },
        {
            "message": "Which districts face high flood risk this week?",
            "expected_user_type": "disaster_response",
            "expected_risk_type": "flood"
        },
        {
            "message": "How can I protect my rice fields from flooding?",
            "expected_user_type": "farmer",
            "expected_risk_type": "flood",
            "expected_crop_type": "rice"
        },
        {
            "message": "What's the emergency response protocol for heatwaves?",
            "expected_user_type": "disaster_response",
            "expected_risk_type": "heatwave"
        }
    ]
    
    # Mock token for testing (in production, use real authentication)
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock_token_for_testing"
    }
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test Case {i}: {test_case['message'][:50]}...")
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/insights/chat",
                headers=headers,
                json={
                    "message": test_case["message"],
                    "context": {"test": True}
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Response received")
                print(f"   User Type: {data.get('user_type', 'N/A')}")
                print(f"   Risk Type: {data.get('risk_type', 'N/A')}")
                print(f"   Crop Type: {data.get('crop_type', 'N/A')}")
                print(f"   Specialized Advice: {len(data.get('specialized_advice', []))} items")
                print(f"   Confidence: {data.get('confidence_score', 0):.2f}")
                
                # Verify expectations
                if data.get('user_type') == test_case.get('expected_user_type'):
                    print("   ✅ User type detection correct")
                else:
                    print(f"   ⚠️  User type mismatch: expected {test_case.get('expected_user_type')}, got {data.get('user_type')}")
                    
            else:
                print(f"❌ HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")

def test_district_risk_assessment():
    """Test district risk assessment endpoint"""
    print("\n🗺️  Testing District Risk Assessment...")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock_token_for_testing"
    }
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/insights/districts?risk_type=flood&timeframe=7 days",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ District assessment received")
            print(f"   Risk Type: {data.get('risk_type')}")
            print(f"   Total Districts: {data.get('total_districts')}")
            print(f"   High Risk Count: {data.get('high_risk_count')}")
            
            # Show top 3 high-risk districts
            districts = data.get('districts', [])[:3]
            for district in districts:
                print(f"   📍 {district['name']}, {district['state']}: {district['risk_level']} ({district['probability']:.1%})")
                
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ District assessment test failed: {e}")

def main():
    """Run all tests"""
    print("🌍 ClimateSphere AI Chatbot Test Suite")
    print("=" * 50)
    
    # Test API health first
    if not test_api_health():
        print("\n❌ APIs are not running. Please start the services first.")
        return
    
    # Test chatbot functionality
    test_chatbot_responses()
    
    # Test district risk assessment
    test_district_risk_assessment()
    
    print("\n" + "=" * 50)
    print("🎉 Test suite completed!")
    print("\n💡 To test the full chatbot experience:")
    print("   1. Open http://localhost:8000/dashboard/chatbot.html")
    print("   2. Try the sample questions:")
    print("      - 'My crop is maize and rainfall has been low - what can I do?'")
    print("      - 'Which districts face high flood risk this week?'")
    print("   3. Switch between user types (Farmer/Disaster Response/General)")

if __name__ == "__main__":
    main()