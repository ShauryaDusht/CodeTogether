from pyngrok import ngrok

port = 8000

public_url = ngrok.connect(port)
print(f"Public URL: {public_url}")

input("Press Enter to exit...\n")
