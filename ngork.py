from pyngrok import ngrok

# Start ngrok tunnel on port 8000
public_url = ngrok.connect(8000)
print(f" * ngrok tunnel running at: {public_url}")

# Keep the script alive
input("Press Enter to stop the tunnel...\n")
ngrok.disconnect(public_url)