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
  query GetEmployeeSkills($employeeId: String!) {
    employeeSkills(employeeId: $employeeId) {
      id
      employeeId
      skillId
      level
      skill {
        id
        name
        category
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
      rows {
        employee {
          id
          name
          role
        }
        skills {
          skillId
          level
        }
      }
      analysis {
        criticalSkills {
          skillId
          skillName
          reason
          count
        }
      }
    }
  }
`
