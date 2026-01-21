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

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: String!) {
    deleteSkill(id: $id)
  }
`

export const ASSIGN_SKILL = gql`
  mutation AssignSkill($input: AssignSkillInput!) {
    assignSkill(input: $input) {
      id
      employeeId
      skillId
      level
    }
  }
`

export const REMOVE_SKILL_ASSIGNMENT = gql`
  mutation RemoveSkillAssignment($id: String!) {
    removeSkillAssignment(id: $id)
  }
`
