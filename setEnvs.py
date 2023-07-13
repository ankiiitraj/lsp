import os

with open('.env') as f:
    for line in f:
        key, value = line.strip().split('=')
        os.system(f'flyctl secrets set {key}={value}')