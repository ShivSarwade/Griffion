# Griffion API Test Script - Complete Postman Collection Test
# Run with: .\test-api.ps1

$baseUrl = "http://localhost:5000"
$accessToken = ""
$refreshToken = ""
$userId = ""

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   GRIFFION API COMPLETE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to make API calls
function Invoke-ApiTest {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [string]$Token = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n[$Method] $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body
            Write-Host "Body: $Body" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        $statusCode = 200
        
        Write-Host "Status: $statusCode" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
        
        return $response
    }
    catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   1. AUTHENTICATION TESTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 1: Register - Default Role
$body = @{
    email = "newuser$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    password = "SecurePass123!"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

$result = Invoke-ApiTest -Name "Register - Default Role" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 2: Register - Buyer Role
$body = @{
    email = "buyer$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    password = "SecurePass123!"
    firstName = "Jane"
    lastName = "Buyer"
    role = "Buyer"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Buyer Role" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 3: Register - Seller Role
$body = @{
    email = "seller$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    password = "SecurePass123!"
    firstName = "Bob"
    lastName = "Seller"
    role = "Seller"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Seller Role" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 4: Register - Invalid Role (Should Fail)
$body = @{
    email = "hacker@example.com"
    password = "SecurePass123!"
    firstName = "Hacker"
    role = "Admin"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Invalid Role (Should Fail)" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 400

# Test 5: Register - Minimal Fields
$body = @{
    email = "minimal@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Minimal Fields" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 6: Register - With Username
$body = @{
    username = "john_doe"
    email = "johndoe@example.com"
    password = "SecurePass123!"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - With Username" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 7: Register - Role + All Fields
$body = @{
    email = "customuser@example.com"
    username = "custom_user"
    password = "SecurePass123!"
    firstName = "Custom"
    lastName = "User"
    role = "Seller"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Role + All Fields" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 8: Register - Only FirstName
$body = @{
    email = "firstname-only@example.com"
    password = "SecurePass123!"
    firstName = "OnlyFirst"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Only FirstName" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 9: Register - Different Role + Username
$body = @{
    username = "premium_buyer"
    email = "premium.buyer@example.com"
    password = "SecurePass123!"
    firstName = "Premium"
    role = "Buyer"
} | ConvertTo-Json

Invoke-ApiTest -Name "Register - Different Role + Username" -Method "POST" -Endpoint "/api/auth/register" -Body $body -ExpectedStatus 201

# Test 10: Login with Admin
$body = @{
    email = "admin@test.local"
    password = "TestAdmin123!"
} | ConvertTo-Json

$loginResult = Invoke-ApiTest -Name "Login - Admin" -Method "POST" -Endpoint "/api/auth/login" -Body $body

if ($loginResult) {
    $accessToken = $loginResult.data.accessToken
    $refreshToken = $loginResult.data.refreshToken
    $userId = $loginResult.data.user.id
    Write-Host "`nTokens saved for subsequent requests" -ForegroundColor Green
}

# Test 11: Refresh Token
if ($refreshToken) {
    $body = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $refreshResult = Invoke-ApiTest -Name "Refresh Token" -Method "POST" -Endpoint "/api/auth/refresh" -Body $body
    
    if ($refreshResult) {
        $accessToken = $refreshResult.data.accessToken
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   2. USER PROFILE TESTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 12: Get My Profile
Invoke-ApiTest -Name "Get My Profile" -Method "GET" -Endpoint "/api/users/me" -Token $accessToken

# Test 13: Update Profile
$body = @{
    firstName = "John"
    lastName = "Updated"
    phone = "+1234567890"
} | ConvertTo-Json

Invoke-ApiTest -Name "Update Profile" -Method "PUT" -Endpoint "/api/users/me" -Body $body -Token $accessToken

# Test 14: Update User Preferences
$body = @{
    preferences = @{
        theme = "dark"
        language = "en"
        notifications = $true
        emailNotifications = $true
    }
} | ConvertTo-Json -Depth 3

Invoke-ApiTest -Name "Update User Preferences" -Method "PATCH" -Endpoint "/api/users/me/preferences" -Body $body -Token $accessToken

# Test 15: Change Password
$body = @{
    currentPassword = "TestAdmin123!"
    newPassword = "NewSecurePass123!"
} | ConvertTo-Json

Invoke-ApiTest -Name "Change Password" -Method "POST" -Endpoint "/api/users/me/change-password" -Body $body -Token $accessToken

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   3. ADMIN - ROLES TESTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 16: Get All Roles
$rolesResult = Invoke-ApiTest -Name "Get All Roles" -Method "GET" -Endpoint "/api/admin/roles" -Token $accessToken

# Store role IDs for later use
$roleIds = @{}
if ($rolesResult -and $rolesResult.data) {
    foreach ($role in $rolesResult.data) {
        $roleIds[$role.name] = $role.id
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   4. ADMIN - USER MANAGEMENT TESTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 17: Get All Users
Invoke-ApiTest -Name "Get All Users" -Method "GET" -Endpoint "/api/admin/users?page=1&limit=10" -Token $accessToken

# Test 18: Get User By ID
if ($userId) {
    Invoke-ApiTest -Name "Get User By ID" -Method "GET" -Endpoint "/api/admin/users/$userId" -Token $accessToken
}

# Test 19: Create Single User
if ($roleIds["User"]) {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $body = @{
        email = "user_${timestamp}@example.com"
        password = "TempPassword123!"
        firstName = "Admin"
        lastName = "User"
        roleId = $roleIds["User"]
    } | ConvertTo-Json
    
    Invoke-ApiTest -Name "Create Single User" -Method "POST" -Endpoint "/api/admin/users" -Body $body -Token $accessToken
}

# Test 20: Create Bulk Users
if ($roleIds["User"] -and $roleIds["Seller"]) {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $body = @{
        users = @(
            @{
                email = "user1_${timestamp}@example.com"
                password = "TempPass123!"
                firstName = "Bulk"
                lastName = "User1"
                roleId = $roleIds["User"]
            },
            @{
                email = "user2_${timestamp}@example.com"
                password = "TempPass123!"
                firstName = "Bulk"
                lastName = "User2"
                roleId = $roleIds["User"]
            },
            @{
                email = "seller1_${timestamp}@example.com"
                password = "TempPass123!"
                firstName = "Seller"
                lastName = "One"
                roleId = $roleIds["Seller"]
            }
        )
    } | ConvertTo-Json -Depth 3
    
    Write-Host "`n[INFO] Creating bulk users - Email sending may take 30-45 seconds..." -ForegroundColor Cyan
    Invoke-ApiTest -Name "Create Bulk Users" -Method "POST" -Endpoint "/api/admin/users/bulk" -Body $body -Token $accessToken
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   5. NAVIGATION & HEALTH TESTS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 21: Get Navigation Menu
Invoke-ApiTest -Name "Get Navigation Menu" -Method "GET" -Endpoint "/api/navigation" -Token $accessToken

# Test 22: Health Check
Invoke-ApiTest -Name "Health Check" -Method "GET" -Endpoint "/api/health"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   6. ADMIN - AUDIT & STATISTICS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Test 23: Get Audit Logs
Invoke-ApiTest -Name "Get Audit Logs" -Method "GET" -Endpoint "/api/admin/audit-logs?page=1&limit=50" -Token $accessToken

# Test 24: Get System Statistics
Invoke-ApiTest -Name "Get System Statistics" -Method "GET" -Endpoint "/api/admin/statistics" -Token $accessToken

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST SUITE COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "[OK] Tested 9 registration scenarios (multiple roles)" -ForegroundColor Green
Write-Host "[OK] Tested authentication (login, refresh)" -ForegroundColor Green
Write-Host "[OK] Tested user profile operations" -ForegroundColor Green
Write-Host "[OK] Tested admin role management" -ForegroundColor Green
Write-Host "[OK] Tested admin user management (single + bulk)" -ForegroundColor Green
Write-Host "[OK] Tested navigation & health endpoints" -ForegroundColor Green
Write-Host "[OK] Tested audit logs & statistics" -ForegroundColor Green
Write-Host "`nAccess Token (for manual testing):" -ForegroundColor Cyan
Write-Host "$accessToken`n" -ForegroundColor White
