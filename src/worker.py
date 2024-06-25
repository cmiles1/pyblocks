from pyscript import sync, document
from pyweb import pydom
import sys
from io import StringIO
import time
import traceback

# Redirect stdout and stderr to capture output
output_stream = StringIO()
sys.stdout = output_stream
sys.stderr = output_stream

# Area for displaying program output
output_area = pydom["#outputArea"][0]


class CustomStdout:
    """ Custom output class to simulate print() behavior """
    def __init__(self):
        pass
    
    def write(self, data):
        # Functionality to display data in the outputArea
        output_stream.write(data)

        output_area.create('code').text = data
    
    def flush(self):
        # Flushes the output stream
        output_stream.flush()

# Initialize with the custom output function
custom_stdout = CustomStdout()
sys.stdout = custom_stdout

class CustomStdin:
    """ Custom input class to simulate input() behavior """
    def __init__(self):
        pass

    def readline(self):
        # Functionality to scan input from the user

        # Create the text area for the user
        # (todo: move to javascript side?)
        div = output_area.create('div',
                                 classes=['input-div']) 
        div.create('textarea',
                   classes=['user-input'])
        
        div.create('button',
                   classes=['submit-button'],
                   html='Submit')
                
        data = sync.waitForClickEvent()

        return data  # Simulate input() behavior

# Initialize with the custom input function
custom_stdin = CustomStdin()
sys.stdin = custom_stdin

global_vars = globals().copy()

# Note : This function contains the editor's entry point to Python
def run(script: str):
    """ Runs a specified Python script and returns the output """
    start_time = time.time()
    out_data = ""
    try:
        exec(script, global_vars)
    except Exception as e:
        out_data = "Error: " + traceback.format_exc() + "\n\n"
    except SystemExit as e:
        out_data = "Program exited with code: " + str(e) + "\n\n"
    finally:
        if not out_data:
            out_data = f"Program completed in {time.time() - start_time:.2f} seconds\n\n"

    output_stream.seek(0)
    return out_data



# Note: this reference is awaited in the JavaScript code.
sync.run = run