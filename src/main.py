from pyweb import pydom

def run_file():
    try:
       raise Exception("Not implemented")
    except Exception as e:
        return f"Error: {e}"
    return f"{e}"    

def run_pyscript(event):
    # TODO: implement saving via blockly here
    
    pydom["div#output"].html = run_file()


