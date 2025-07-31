import datetime
import numpy as np


def get_valid_birth_date():
    while True:
        try:
            # birth_str = input("请输入您的出生日期（格式为 YYYY-MM-DD）：")
            birth_str = '1991-04-21'
            birth_date = datetime.datetime.strptime(birth_str, "%Y-%m-%d")
            return birth_date
        except ValueError:
            print("无效的日期格式，请重新输入。")


def get_current_date():
    return datetime.datetime.today()


def calculate_biorhythm(birth_date, current_date):
    days_since_birth = (current_date - birth_date).days

    physical_value = int(100 * np.sin(2 * np.pi * days_since_birth / 23))
    emotional_value = int(100 * np.sin(2 * np.pi * days_since_birth / 28))
    intellectual_value = int(100 * np.sin(2 * np.pi * days_since_birth / 33))

    return physical_value, emotional_value, intellectual_value


def calculate_rhythm_value(cycle, days_since_birth):
    return int(100 * np.sin(2 * np.pi * days_since_birth / cycle))
