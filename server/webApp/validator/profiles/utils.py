"""
Unittest Utilities
"""
import inspect
import unittest

from pathlib import Path
from unittest import defaultTestLoader
from typing import Dict, List, Tuple, Union
from .test_suites.test_setup import SetupTestCase, SetupTestSuite

# Consts
test_dirs = [
    str(Path(__file__).parent.joinpath("test_suites")),  # Local Dir
    # "./tests"  # Custom Dir
]


# Util Functions
def inherits_from(child, parents: Union[Tuple[type, ...], type]):
    parents = tuple(p.__name__ for p in ((parents, ) if isinstance(parents, type) else parents))  # pylint: disable=superfluous-parens
    if inspect.isclass(child):
        bases = [c.__name__ for c in inspect.getmro(child)[1:]]
        if [p for p in parents if p in bases]:
            return True
    return False


def load_test_suite() -> SetupTestSuite:
    suite = SetupTestSuite()
    for d in test_dirs:
        suite.addTests(defaultTestLoader.discover(start_dir=d, pattern="*_tests.py"))
    return suite


def tests_in_suite(suite: unittest.TestSuite) -> Dict[str, Dict[str, Union[str, Dict[str, str]]]]:
    rtn = {}
    for test in suite:
        if unittest.suite._isnotsuite(test):
            test_suite, fun_name = test.id().split(".")[-2:]
            fun = getattr(test, fun_name)
            if test.profile:
                profiles = list(map(str.lower, test.profile if isinstance(test.profile, list) else [test.profile]))
                rtn.setdefault(test_suite, dict(
                    profiles=profiles,
                    doc=(test.__doc__ or "").strip(),
                    tests={}
                ))["tests"][fun_name] = (fun.__doc__ or "").strip()
        else:
            rtn.update(tests_in_suite(test))
    return rtn


def _load_tests(s: unittest.TestSuite, t: Union[Dict[str, List[str]], List[str]], **kwargs) -> list:
    rtn = []
    test_list = []
    if isinstance(t, dict):
        for c, ts in t.items():
            c = c if c.endswith("_UnitTests") else f"{c}_UnitTests"
            test_list.extend([f"{c}{f'.{f}' if f else ''}" for f in ts] if ts else [c])
    else:
        test_list.extend(t)

    for test in s:
        if unittest.suite._isnotsuite(test):
            f = test.id().split(".")[-2:]
            cls = test.__class__
            if not inherits_from(cls, SetupTestCase):
                cls = type(
                    cls.__name__,
                    (SetupTestCase, ),
                    {
                        "__doc__": getattr(cls, "__doc__", ""),
                        "profile": getattr(cls, "profile", "Unknown"),
                        f[1]: getattr(test.__class__, f[1])
                    }
                )
            for t in test_list:  # pylint: disable=redefined-argument-from-local
                t = t.split(".")
                if (t[0] == f[0] and len(t) == 1) or (t[0] == f[0] and t[1] == f[1]):
                    rtn.append(cls(f[1], **kwargs))
        else:
            rtn.extend(_load_tests(test, test_list))
    return rtn


def get_profile_suite(suite: unittest.TestSuite, *profiles: str, **kwargs) -> SetupTestSuite:
    rtn = SetupTestSuite(**kwargs)
    for test in suite:
        if unittest.suite._isnotsuite(test):
            if test.profile:
                test_profiles = list(map(str.lower, test.profile if isinstance(test.profile, list) else [test.profile]))
                if any(p in test_profiles for p in profiles):
                    rtn.addTest(test)
        else:
            rtn.addTests(get_profile_suite(test, *profiles, **kwargs))
    return rtn


# Util Classes
class TestResults(unittest.TextTestResult):
    _testReport: dict

    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self._testReport = {}

    def getReport(self, verbose: bool = False) -> dict:
        """
        Returns the run tests as a list of the form of a dict
        """
        rtn: Dict[str, dict] = {
            "stats": {
                "overall": self._getStats(self._testReport, True)
            }
        }

        for profile, tests in self._testReport.items():
            rtn[profile] = {}
            for key, val in tests.items():
                if verbose:
                    rtn[profile][key] = {k: v if isinstance(v, str) else "" for k, v in val.items()}
                else:
                    rtn[profile][key] = list(val.keys())
            rtn["stats"][profile] = self._getStats(rtn[profile])
        return rtn

    def addError(self, test: unittest.case.TestCase, err) -> None:
        super().addError(test, err)
        self._addReport("error", test, err)

    def addFailure(self, test: unittest.case.TestCase, err) -> None:
        super().addFailure(test, err)
        self._addReport("failure", test, err)

    def addSuccess(self, test: unittest.case.TestCase) -> None:
        super().addSuccess(test)
        self._addReport("success", test)

    def addExpectedFailure(self, test: unittest.case.TestCase, err) -> None:
        super().addExpectedFailure(test, err)
        self._addReport("expected_failure", test, err)

    def addSkip(self, test: unittest.case.TestCase, reason: str) -> None:
        super().addSkip(test, reason)
        self._addReport("skipped", test, reason)

    def addUnexpectedSuccess(self, test: unittest.case.TestCase) -> None:
        super().addUnexpectedSuccess(test)
        self._addReport("unexpected_success", test)

    def addSubTest(self, test, subtest, err):
        subparams = ", ".join([f"{k}='{v}'" for k, v in subtest.params.items()])
        subtest._testMethodName = f"{test._testMethodName} subTest({subparams})"
        subtest.profile = test.profile
        if err is None:
            self.addSuccess(subtest)
        else:
            self.addFailure(subtest, err)

        super().addSubTest(test, subtest, err)
        # add to total number of tests run
        self.testsRun += 1

    # Helper Functions
    def _addReport(self, category: str, test: unittest.case.TestCase, err: Union[tuple, str] = None) -> None:
        profile = self._getProfile(test)
        val = err or test
        if isinstance(val, tuple):
            exctype, value, _ = err
            val = f"{exctype.__name__}: {value}"
        self._testReport.setdefault(profile, {}).setdefault(category, {})[test._testMethodName] = val

    def _getProfile(self, test: unittest.case.TestCase) -> str:
        profile = getattr(test, "profile", "Unknown")
        return (profile[0] if isinstance(profile, list) else profile).lower()

    def _getStats(self, results: dict, overall: bool = False) -> Dict[str, int]:
        stats = ("error", "failure", "success", "expected_failure", "skipped", "unexpected_success")
        rtn = dict(
            total=0,
            error=0,
            failure=0,
            success=0,
            expected_failure=0,
            skipped=0,
            unexpected_success=0
        )

        if overall:
            for p in results:
                for s in stats:
                    c = len(results[p].get(s, {}))
                    rtn[s] += c
                    rtn["total"] += c
        else:
            for s in stats:
                c = len(results.get(s, {}))
                rtn[s] += c
                rtn["total"] += c

        return rtn
