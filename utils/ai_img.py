# media_client.py

import os
import base64
import time
import argparse
from together import Together
from typing import List, Optional

# A dictionary mapping easy-to-use names to the official Together AI model identifiers
TOGETHER_AI_MODELS = {
    "FLUX.1 Schnell Free": "black-forest-labs/FLUX.1-schnell-Free",
    "FLUX.1 Dev": "black-forest-labs/FLUX.1-dev",
    "FLUX.1 Schnell": "black-forest-labs/FLUX.1-schnell",
    "FLUX.1 Redux Dev": "black-forest-labs/FLUX.1-Redux-dev",
    "FLUX.1 Canny Dev": "black-forest-labs/FLUX.1-Canny-dev",
    "FLUX.1 Depth Dev": "black-forest-labs/FLUX.1-Depth-dev",
}

# (Keep the rest of your code the same, just replace this function)
def generate_together_image(
    model: str,
    prompt: str,
    num_images: int = 1,
    resolution: str = "1024x1024",
    steps: int = 4,
    image_path: Optional[str] = None,
    control_image_path: Optional[str] = None,
) -> List[str]:
    """
    Generates images using the Together AI API.
    """
    try:
        # ... (all the setup code remains the same)
        api_key = os.environ.get("TOGETHER_API_KEY")
        if not api_key:
            raise ValueError("TOGETHER_API_KEY environment variable not set. Please set it before running.")
        
        client = Together(api_key=api_key)

        if model == "black-forest-labs/FLUX.1-schnell-Free" and not (1 <= steps <= 4):
            raise ValueError(f"The model 'FLUX.1 Schnell Free' requires steps to be between 1 and 4. You provided {steps}.")

        api_args = {
            "prompt": prompt, "model": model, "n": num_images, "steps": steps,
        }
        
        try:
            width, height = map(int, resolution.lower().split('x'))
            api_args['width'] = width
            api_args['height'] = height
        except ValueError:
            raise ValueError("Invalid resolution format. Use 'widthxheight'.")

        if image_path:
            if not os.path.exists(image_path): raise FileNotFoundError(f"Input image not found: {image_path}")
            with open(image_path, "rb") as f:
                api_args['image_base64'] = base64.b64encode(f.read()).decode("utf-8")
        
        if control_image_path:
            if not os.path.exists(control_image_path): raise FileNotFoundError(f"Control image not found: {control_image_path}")
            with open(control_image_path, "rb") as f:
                api_args['control_image_base64'] = base64.b64encode(f.read()).decode("utf-8")

        print("-" * 50)
        print(f"Requesting {num_images} image(s) with model: {model}")
        print(f"Prompt: {prompt}")
        print(f"Steps: {steps}")
        print("-" * 50)

        response = client.images.generate(**api_args)

        saved_files = []
        if not response.data:
            print("API call successful, but no image data returned (check safety filters).")
            # ADDED: Print the full response for debugging
            print("Full server response:", response)
            return []

        for i, image_obj in enumerate(response.data):
            if image_obj.b64_json:
                print(f"Image {i+1}/{num_images} received successfully!")
                image_bytes = base64.b64decode(image_obj.b64_json)
                timestamp = int(time.time())
                file_name = f"generated_image_{timestamp}_{i+1}.png"
                with open(file_name, "wb") as f:
                    f.write(image_bytes)
                print(f"Image saved as {file_name}")
                saved_files.append(file_name)
            else:
                print(f"Image {i+1}/{num_images} content was filtered by the safety system.")
                # ADDED: Print the specific image object that failed for more info
                print("Reason:", image_obj)
        
        return saved_files

    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# (The rest of the file, including the argparse part, remains the same)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate images using the Together AI API.")
    
    parser.add_argument("prompt", type=str, nargs="?", help="The text prompt for image generation.")

    parser.add_argument(
        "--model_name", type=str, default="FLUX.1 Schnell Free", 
        choices=list(TOGETHER_AI_MODELS.keys()), help="The friendly name of the model to use."
    )
    parser.add_argument("--num_images", type=int, default=1, help="Number of images to generate.")
    parser.add_argument("--resolution", type=str, default="1024x1024", help="Image resolution, e.g., '1024x1024'.")
    # CORRECTED: Changed default steps to 4 and updated help text
    parser.add_argument("--steps", type=int, default=4, help="Number of diffusion steps. The free FLUX model requires a value between 1-4.")
    parser.add_argument("--image_path", type=str, help="Path to input image for image-to-image tasks.")
    parser.add_argument("--control_image_path", type=str, help="Path to control image for structure guidance.")
    parser.add_argument("--list_models", action="store_true", help="List all available models and exit.")

    args = parser.parse_args()
    
    if args.list_models:
        print("Available Models:")
        for name in TOGETHER_AI_MODELS:
            print(f"- {name}")
        exit()

    if not args.prompt:
        print("Error: A prompt is required.")
        parser.print_help()
        exit(1)

    model_identifier = TOGETHER_AI_MODELS[args.model_name]

    generate_together_image(
        model=model_identifier, prompt=args.prompt, num_images=args.num_images,
        resolution=args.resolution, steps=args.steps, image_path=args.image_path,
        control_image_path=args.control_image_path
    )