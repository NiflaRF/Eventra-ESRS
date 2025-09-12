<?php
/**
 * Contact Message Model
 * Eventra ESRS Backend
 */

class ContactMessage {
    private $conn;
    private $table_name = "contact_messages";

    public $id;
    public $name;
    public $email;
    public $message;
    public $status;
    public $priority;
    public $replied_by;
    public $reply_message;
    public $replied_at;
    public $ip_address;
    public $user_agent;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new contact message
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    name = :name,
                    email = :email,
                    message = :message,
                    status = :status,
                    priority = :priority,
                    ip_address = :ip_address,
                    user_agent = :user_agent";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->status = htmlspecialchars(strip_tags($this->status ?? 'unread'));
        $this->priority = htmlspecialchars(strip_tags($this->priority ?? 'medium'));
        $this->ip_address = htmlspecialchars(strip_tags($this->ip_address));
        $this->user_agent = htmlspecialchars(strip_tags($this->user_agent));

        // Bind data
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":ip_address", $this->ip_address);
        $stmt->bindParam(":user_agent", $this->user_agent);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Read all contact messages with optional filters
     */
    public function read($status = null, $priority = null, $limit = null) {
        $query = "SELECT id, name, email, message, status, priority, 
                         replied_by, reply_message, replied_at, 
                         ip_address, created_at, updated_at
                  FROM " . $this->table_name;
        
        $conditions = [];
        if ($status) {
            $conditions[] = "status = :status";
        }
        if ($priority) {
            $conditions[] = "priority = :priority";
        }
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $query .= " ORDER BY created_at DESC";
        
        if ($limit) {
            $query .= " LIMIT :limit";
        }

        $stmt = $this->conn->prepare($query);

        if ($status) {
            $stmt->bindParam(":status", $status);
        }
        if ($priority) {
            $stmt->bindParam(":priority", $priority);
        }
        if ($limit) {
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

    /**
     * Read single contact message by ID
     */
    public function readOne() {
        $query = "SELECT id, name, email, message, status, priority, 
                         replied_by, reply_message, replied_at, 
                         ip_address, user_agent, created_at, updated_at
                  FROM " . $this->table_name . "
                  WHERE id = :id
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->message = $row['message'];
            $this->status = $row['status'];
            $this->priority = $row['priority'];
            $this->replied_by = $row['replied_by'];
            $this->reply_message = $row['reply_message'];
            $this->replied_at = $row['replied_at'];
            $this->ip_address = $row['ip_address'];
            $this->user_agent = $row['user_agent'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    /**
     * Update contact message status
     */
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Add reply to contact message
     */
    public function addReply() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    reply_message = :reply_message,
                    replied_by = :replied_by,
                    replied_at = CURRENT_TIMESTAMP,
                    status = 'replied',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->reply_message = htmlspecialchars(strip_tags($this->reply_message));
        $this->replied_by = htmlspecialchars(strip_tags($this->replied_by));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":reply_message", $this->reply_message);
        $stmt->bindParam(":replied_by", $this->replied_by);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Delete contact message
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    /**
     * Get count of unread messages
     */
    public function getUnreadCount() {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE status = 'unread'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'];
    }

    /**
     * Get recent contact messages
     */
    public function getRecentMessages($limit = 5) {
        $query = "SELECT id, name, email, message, status, created_at
                  FROM " . $this->table_name . "
                  ORDER BY created_at DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    /**
     * Update priority
     */
    public function updatePriority() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    priority = :priority,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->priority = htmlspecialchars(strip_tags($this->priority));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>