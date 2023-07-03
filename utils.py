from itertools import product
import random


def generate_a_name():
    first_name = "jay", "jim", "roy", "axel", "billy", "charlie", "jax", "gina", "paul", "ringo", "ally", "nicky", "cam", "ari", "trudie", "cal", "carl", "lady", "lauren", "ichabod", "arthur", "ashley", "drake", "kim", "julio", "lorraine", "floyd", "janet", "lydia", "charles", "pedro", "bradley"
    last_name = "barker", "style", "spirits", "murphy", "blacker", "bleacher", "rogers","warren", "keller"

    full_names = ["{}+{}".format(f, l) for f, l in product(first_name, last_name) if f != l]
    random.shuffle(full_names)
    return full_names[0]

