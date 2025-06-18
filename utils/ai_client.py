import os
import threading
import time
import openai
import dotenv
try:
    import database_manager as db_manager
except:
    import utils.database_manager as db_manager

dotenv.load_dotenv()

"""class SequentialPrinter:
    def __init__(self, text_speed: float=0.01, chunk_buffer_min_size: int=10):
        self.chunk_buffer = []
        self.printing = False
        self.printing_thread = threading.Thread(target=self.print)
        self.text_speed = text_speed
        self.avg_chunk_size = 0
        self.chunks = 0
        self.chunk_buffer_min_size = chunk_buffer_min_size
        
        pass

    def print(self):
        self.printing = True
        
        self.avg_chunk_size = 0
        self.chunks = 0
        while self.printing:
            if len(self.chunk_buffer) > self.chunk_buffer_min_size or 0 in self.chunk_buffer:
                if self.chunk_buffer[0] != 0:
                    chunk = self.chunk_buffer[0]

                    self.avg_chunk_size += len(chunk)
                    self.chunks += 1

                    self.chunk_buffer.pop(0)

                    for char in chunk:
                        print(char, end="", flush=True)
                        time.sleep(self.text_speed)
                else:
                    self.printing = False
                    break

        self.avg_chunk_size = (self.avg_chunk_size / self.chunks) if self.chunks > 0 else 0
        print(f"\nAverage chunk size: {printer.avg_chunk_size} characters")

    def start_printing(self):
        self.printing_thread.start()
        
        return
    
    def stop_printing(self):
        self.printing = False
        return"""

#model_to_use = "together_ai/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
providers = {
    "together": {
        "url": "https://api.together.xyz/v1",
        "key": os.environ.get("TG_KEY"),
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    }
}

# 2. Choose which provider to use
provider_name = "together" # Change this to "openai" or "my_custom_api" to switch!
selected_provider = providers[provider_name]

#client = openai.OpenAI(
#  api_key=selected_provider["key"],
#  base_url=selected_provider["url"],
#)


#printer = SequentialPrinter(text_speed=0.005)
#printer.start_printing()

def send_with_client(client: openai.OpenAI, chat_id, msg: str, strg):
    messages = db_manager.getChatMessagesWithIDQuery(chat_id)
    messages_send = []
    for message in messages:
        _, sender, _, content, _ = message
        messages_send.append({"role": sender, "content": content})
    
    if len(messages_send) != 1:
        messages_send.append({"usr": sender, "content": msg})

    full_msg = ""
    
    try:
        # The call looks identical to a standard SDK, but it's using YOUR client
        stream = client.chat.completions.create(
            model=selected_provider["model"],
            messages=messages_send,
            stream=True
        )
        for chunk in stream:
            # Our client yields an object, so the access pattern is clean
            if hasattr(chunk.choices[0].delta, 'content') and chunk.choices[0].delta.content:
                text_chunk = chunk.choices[0].delta.content
                full_msg += text_chunk
                yield text_chunk

    except Exception as e:
        print(f"\nAn API error occurred: {e}")
    finally:
        strg.storage = full_msg
        strg.ready = True
#print()