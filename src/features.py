"""
Feature Engineering Module.

Defines feature transformations (e.g. funding velocity, burn-rate proxy,
network centrality). This file will serve as the basis for Feast feature definitions.
"""


def compute_funding_velocity(df):
    """
    Compute funding velocity (total funding / months active).
    """
    pass


def compute_burn_rate_proxy(df):
    """
    Compute a proxy for burn rate.
    """
    pass


def compute_network_centrality(df):
    """
    Compute network centrality based on co-investor count.
    """
    pass
