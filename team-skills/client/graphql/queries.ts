import gql from "graphql-tag"

export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      name
      email
      role
      defaultDailyCapacityHours
    }
  }
`

export const GET_SKILLS = gql`
  query GetSkills {
    skills {
      id
      name
      category
      description
    }
  }
`

export const GET_EMPLOYEE_SKILLS = gql`
  query GetEmployeeSkills($employeeId: ID!) {
    employeeSkills(employeeId: $employeeId) {
      id
      employeeId
      skillId
      level
      skill {
        id
        name
        category
        description
      }
    }
  }
`

export const GET_SKILLS_MATRIX = gql`
  query GetSkillsMatrix($filters: MatrixFilterInput) {
    skillsMatrix(filters: $filters) {
      skills {
        id
        name
        category
      }
      employees {
        id
        name
        role
        skills {
          skillId
          level
        }
      }
      criticalSkills {
        skillId
        skillName
        holderCount
        expertCount
        isCritical
      }
    }
  }
`

export const EXPORT_SKILLS_MATRIX_CSV = gql`
  query ExportSkillsMatrixCSV($filters: MatrixFilterInput) {
    exportSkillsMatrixCSV(filters: $filters)
  }
`
