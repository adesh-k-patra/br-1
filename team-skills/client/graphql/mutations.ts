import gql from "graphql-tag"

export const CREATE_SKILL = gql`
  mutation CreateSkill($input: CreateSkillInput!) {
    createSkill(input: $input) {
      id
      name
      category
      description
    }
  }
`

export const UPDATE_SKILL = gql`
  mutation UpdateSkill($input: UpdateSkillInput!) {
    updateSkill(input: $input) {
      id
      name
      category
      description
    }
  }
`

export const REMOVE_SKILL = gql`
  mutation RemoveSkill($id: ID!) {
    removeSkill(id: $id)
  }
`

export const ASSIGN_SKILL = gql`
  mutation AssignSkill($input: CreateEmployeeSkillInput!) {
    assignSkill(input: $input) {
      id
      employeeId
      skillId
      level
    }
  }
`

export const UPDATE_EMPLOYEE_SKILL = gql`
  mutation UpdateEmployeeSkill($input: UpdateEmployeeSkillInput!) {
    updateEmployeeSkill(input: $input) {
      id
      employeeId
      skillId
      level
    }
  }
`

export const UNASSIGN_SKILL = gql`
  mutation UnassignSkill($id: ID!) {
    unassignSkill(id: $id)
  }
`
