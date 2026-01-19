<script setup lang="ts">
const { user } = useAuth()

if (user.value?.role === "manager") {
  navigateTo("/employees")
} else {
  navigateTo("/my-absences")
}
</script>
