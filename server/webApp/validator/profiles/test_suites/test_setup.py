"""
Conformance Test Setup
"""
import json
import os
import re
import unittest

from collections import namedtuple
from functools import wraps
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Tuple, Type, Union
from xml.dom import minidom
from jadnschema import Schema
from jadnschema.convert import Message, MessageType, SerialFormats

# Consts
MessageTest = namedtuple("Message", ("path", "type", "profile", "state", "name", "fmt"))
CMD_MSG = "OpenC2-Command"
RSP_MSG = "OpenC2-Response"


# Utils
def ext_glob(base: str, ext: Iterable[str], bases: Tuple[str, ...] = None) -> List[MessageTest]:
    base_path = Path(base)
    rtn = []
    for e in ext:
        for f in base_path.rglob(f"*.{e}"):
            rel_f = f.relative_to(base)
            if bases and not f"{rel_f}".startswith(bases):
                continue
            parts = rel_f.parts
            name, _ = os.path.splitext(parts[-1])
            rtn.append(MessageTest(f"{f}", *parts[:3], name, e))
    return rtn


def wrapped_method(func, *args1, **kwargs1):
    @wraps(func)  # copy attributes to start, they can be overwritten later
    def method(self, *args2, **kwargs2):
        return func(self, *args1, *args2, **kwargs1, **kwargs2)
    return method


class MetaTests(type):
    def __new__(mcs, name, bases, attrs, **kwargs):  # pylint: disable=bad-classmethod-argument
        new_namespace = {
            **attrs,
            **kwargs,
        }
        msg_dirs = [b._msg_dir for b in reversed(bases) if issubclass(b, unittest.TestCase) and b != unittest.TestCase]
        if msg_dir := attrs.get("_msg_dir"):
            msg_dirs.append(msg_dir)
        # Get test functions
        good_test = mcs.get_attribute("_test_good_msg", attrs, bases)
        bad_test = mcs.get_attribute("_test_bad_msg", attrs, bases)

        # Make tests
        if profile := attrs.get("profile"):
            if len(msg_dirs) > 0:
                messages = [m for md in msg_dirs for m in ext_glob(md, SerialFormats, ("request", "response"))]
                profiles = []
                if isinstance(profile, str):
                    profiles = [profile.lower()]
                elif isinstance(profile, list):
                    profiles = list(map(str.lower, profile))
                new_namespace.update(mcs.load_tests(profiles, messages, good_test, bad_test))
        return super(MetaTests, mcs).__new__(mcs, name, bases, new_namespace)

    @classmethod
    def load_tests(mcs, profiles: List[str], messages: List[MessageTest], good_test: Callable, bad_test: Callable) -> dict:
        tests = {}
        for msg in messages:
            if msg.profile in profiles:
                name = msg.name.replace(os.path.sep, "_")
                test_fun: Callable
                if msg.state == "good":
                    test_fun = good_test
                elif msg.state == "bad":
                    test_fun = bad_test
                else:
                    print(f"Unknown message state: {msg.state}")
                    continue

                tests[f"test_{msg.fmt}_{name}"] = wrapped_method(test_fun, msg_file=msg.path, fmt=msg.fmt)
                args = {"msg_file": Path(msg.path).name, "fmt": msg.fmt}
                tests[f"test_{msg.fmt}_{name}"].__doc__ = re.sub(r"\n\s+", "\n", test_fun.__doc__.format(**args))
        return tests

    @classmethod
    def get_attribute(mcs, attr: str, namespace: dict, bases: Tuple[Type]) -> Any:
        if attr in namespace:
            return namespace[attr]
        for b in reversed(bases):
            if issubclass(b, unittest.TestCase) and b != unittest.TestCase:
                if val := getattr(b, attr, None):
                    return val
        return None


class SetupTestCase(unittest.TestCase, metaclass=MetaTests):
    """
    OpenC2 TestCase setup class
    """
    _msg_dir = Path(__file__).parent.parent.joinpath("messages")
    _schema_obj: Schema
    msg_files: Dict[str, dict]
    profile: Union[str, List[str]] = None

    def __init__(self, methodName: str = 'runTest', **kwargs):
        super().__init__(methodName=methodName)
        self.msg_files = {}
        self._setupKwargs(**kwargs)

    def __call__(self, *args, **kwargs):
        self._setupKwargs(**kwargs)
        return self.run(*args)

    def debug(self, **kwargs):  # pylint: disable=arguments-differ
        self._setupKwargs(**kwargs)
        super().debug()

    def _setupKwargs(self, **kwargs):
        self._schema_obj = kwargs.get('schema', None)

    # Dynamic test functions
    def _load_msg(self, msg_file: str, fmt: SerialFormats) -> Message:
        file_fmt = SerialFormats.from_value(os.path.splitext(msg_file)[1][1:])
        if msg_file in self.msg_files:
            m = self.msg_files[msg_file]
        else:
            msg = Path(msg_file)
            m = msg.read_bytes() if SerialFormats.is_binary(file_fmt) else msg.read_text(encoding="utf-8")
        try:
            msg = Message.oc2_loads(m, file_fmt)
        except Exception as e:
            err = f"{msg_file} - {e}"
            raise Exception(err)
        msg.content_type = fmt
        return msg

    def _equality(self, msg1: Union[bytes, str], msg2: Union[bytes, str], fmt: SerialFormats, equal=True) -> None:
        # TODO: Add more format comparisons?
        if fmt == SerialFormats.JSON:
            msg1 = json.loads(msg1)
            msg2 = json.loads(msg2)
            if equal:
                self.assertDictEqual(msg1, msg2)
            else:
                self.assertRaises(AssertionError, self.assertDictEqual(msg1, msg2))
        elif fmt == SerialFormats.XML:
            msg1 = minidom.parseString("".join(map(str.lstrip, msg1.split("\n")))).toxml()
            msg2 = minidom.parseString(msg2).toxml()

        if equal:
            self.assertEqual(msg1, msg2)
        else:
            self.assertNotEqual(msg1, msg2)

    # Base tests for dynamic messages
    def _test_good_msg(self, msg_file: str, fmt: SerialFormats) -> None:
        """
        Test a known good message against the given schema
        Load and test `{msg_file}` using `{fmt}` format
        """
        msg = self._load_msg(msg_file, fmt)
        msg_type = CMD_MSG if msg.msg_type == MessageType.Request else RSP_MSG
        self._schema_obj.validate_as(msg_type, msg.content)

    def _test_bad_msg(self, msg_file: str, fmt: SerialFormats) -> None:
        """
        Test a known bad message against the given schema
        Load and test `{msg_file}` using `{fmt}` format
        """
        with self.assertRaises(Exception):
            msg = self._load_msg(msg_file, fmt)
            msg_type = CMD_MSG if msg.msg_type == MessageType.Request else RSP_MSG
            self._schema_obj.validate_as(msg_type, msg.content)


class SetupTestSuite(unittest.TestSuite):
    """
    Basic OpenC2 TestSuite Class
    """
    _testKwargs: dict

    def __init__(self, tests: tuple = (), **kwargs):
        super().__init__(tests=tests)
        self._testKwargs = kwargs

    def run(self, result, debug=False):
        topLevel = False
        if getattr(result, "_testRunEntered", False) is False:
            result._testRunEntered = topLevel = True

        for index, test in enumerate(self):
            if result.shouldStop:
                break

            if unittest.suite._isnotsuite(test):
                self._tearDownPreviousClass(test, result)
                self._handleModuleFixture(test, result)
                self._handleClassSetUp(test, result)
                result._previousTestClass = test.__class__

                if (getattr(test.__class__, "_classSetupFailed", False) or getattr(result, "_moduleSetUpFailed", False)):
                    continue

            if not debug:
                test(result, **self._testKwargs)
            else:
                test.debug(**self._testKwargs)

            if self._cleanup:
                self._removeTestAtIndex(index)

        if topLevel:
            self._tearDownPreviousClass(None, result)
            self._handleModuleTearDown(result)
            result._testRunEntered = False
        return result
