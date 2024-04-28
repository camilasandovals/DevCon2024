# CartApp

## Dependencies

Add the following packages to your `package.json` file:

- `expo-camera`: Version `~14.1.2`
- `expo-file-system`: Version `~16.0.9`

## API Setup

The CartApp utilizes FastAPI and OpenAI's GPT-4 Turbo model. Here's how to set up the API:

### Import Required Modules

```python

from fastapi import FastAPI, File, HTTPException, UploadFile
from openai import OpenAI
import base64

app = FastAPI()
client = OpenAI(api_key="REPLACE WITH YOUR API KEY")


@app.post("/")
async def get_openai_response_post(image: UploadFile = File(...)):
  try:
    base64_image = await convert_image_to_base64(image) # convert image to base64

    # send the image to OpenAI's GPT-4 Turbo model
    response = client.chat.completions.create(
        model="gpt-4-turbo",
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
        max_tokens=15, # limits how long the response can be
        top_p=0.1) #uses common and fitting words instead of rare or strange ones so it makes the response more predictable

    # extract the food and price from the response
    food, price = response.choices[0].message.content.split('=')

    return {"food": food, "price": price}

  except Exception as e:
    print(f"Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))


async def convert_image_to_base64(image: UploadFile):
  """Base64 is a method used to encode data, such as images or text files, into a string of characters that can be easily transmitted over the internet or stored in a text-based format."""
  image_content = await image.read()
  return base64.b64encode(image_content).decode('utf-8')


system_prompt = """
You are an agent specialized in tagging images of food and proving its possible price.
You will be provided with an image and your goal is to identify what food it is and it's estimated price.
The price shouldn't be the most updated, just give an estimate from stores like Walmart, Publix, Whole Foods, etc.
Return the food and the price in the format of a string separated with an equal sign, like this: Oldfashioned Oatmeal=3.99
If it's not food or you can't identify the price just return 'unknown' for both price and food.
"""


#