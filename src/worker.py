from pyscript import sync
import sys
from io import StringIO



# Redirect stdout and stderr to capture output
output_stream = StringIO()
sys.stdout = output_stream
sys.stderr = output_stream


class CustomStdin:
    """ Custom input class to simulate input() behavior """
    def __init__(self):
        pass
    
    def readline(self):
        # For compatibility with input(), read line by line
        return "Custom input response" + "\n"  # Simulate input() behavior


# Initialize with the custom input function
custom_stdin = CustomStdin()
sys.stdin = custom_stdin


# Note : This function contains the entry point to Python
def run(script: str):
    """ Runs a specified Python script and returns the output """
    script = """
x = input('What is your name? ')
print('Hello, ' + x)    
"""
    try:
        exec(script)
    except Exception as e:
        print(e, file=sys.stderr)

    data = output_stream.getvalue()
    output_stream.seek(0)
    return data



# Note: this reference is awaited in the JavaScript code.
sync.run = run