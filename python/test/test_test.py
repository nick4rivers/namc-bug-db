from lib.mymodule import say_hello
import pytest


def test_pass():
    a = 1 + 1
    b = say_hello()
    assert a == 2


def test_fail():
    a = 1 + 1
    b = say_hello()
    assert a is True


if __name__ == "__main__":
    pytest.main([__file__])
