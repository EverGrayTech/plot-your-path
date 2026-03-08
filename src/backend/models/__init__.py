"""Database models package."""

from backend.models.application_material import ApplicationMaterial
from backend.models.company import Company
from backend.models.desirability_factor_config import DesirabilityFactorConfig
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.role_status_change import RoleStatusChange
from backend.models.skill import Skill

__all__ = [
    "ApplicationMaterial",
    "Company",
    "DesirabilityFactorConfig",
    "DesirabilityScoreResult",
    "Role",
    "RoleFitAnalysis",
    "Skill",
    "RoleSkill",
    "RoleStatusChange",
]
