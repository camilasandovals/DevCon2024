# CartApp 🛒

AI Mobile App created with React Native and FastAPI, implements ChatGPT to identify what is in the picture taken, and provides the average price of the food item.

## React Native Base Code
Go to this URL: [snack.expo.dev/@camilasandovals/cartapp](https://snack.expo.dev/@camilasandovals/cartapp)

## API Setup

The CartApp utilizes FastAPI and OpenAI's GPT-4 Turbo model. 

Here's how to set up the API:

1. Go to [platform.openai.com/](https://platform.openai.com/) and login or create an account
2. Inside of settings, add the billing information
3. Create an API key
4. Go to [replit.com/](https://replit.com/) and create a Replit account
5. Click on the `+ Create Repl` button to create a new Repl
6. Select the `FastAPI` template
7. Install the dependencies by running the following commands in the shell:

```shell
pip install python-multipart
pip install openai
```

8. Copy this code in the editor, it creates a FastAPI server with a POST endpoint that accepts an image file and returns the food item and its estimated price.

```python

from fastapi import FastAPI, File, HTTPException, UploadFile
from openai import OpenAI
import base64

app = FastAPI()
client = OpenAI(api_key="REPLACE WITH YOUR API KEY")

@app.get("/")
def read_root():
    return "Let's save some money !!"

@app.post("/")
async def get_openai_response_post(image: UploadFile = File(...)):
    try:
        image_content = await image.read()
        base64_image = base64.b64encode(image_content).decode(
            'utf-8')  # convert image to base64

        # send the image to OpenAI's GPT-4-o
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role":
                "user",
                "content": [
                    {
                        "type": "text",
                        "text": system_prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        },
                    },
                ],
            }],
            response_format={"type": "json_object"},
            max_tokens=25,  # limits how long the response can be
            top_p=0.1,
            temperature=0  #less creative
        )  #uses common and fitting words instead of rare or strange ones so it makes the response more predictable

        # extract the food and price from the response
        response = response.choices[0].message.content
        print(response)
        if response is None:
            return None
        return json.loads(response)

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


system_prompt = """
You are an agent specialized in tagging images of food and proving its possible price.
The price shouldn't be the most updated, just give an estimate from stores like Walmart, Publix, Whole Foods, etc.
Return in json format: {food: "Oldfashioned Oatmeal", price=3.99}
If it's not food or you can't identify the price just return 'unknown' for both price and food.
If there are 2 or more food items in the image, return only one of them.
"""

```

### Documentation:

https://platform.openai.com/docs/guides/vision
