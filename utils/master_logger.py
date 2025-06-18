import logging
import os

class MasterLogger:
    """
    An object that contains a logger capable of logging to console and a file
    """
    def __init__(self, process: str, path: str=None):
        """
        Creates a MasterLogger object which contains a logger capable of logging to console and a file
        """
        # Setup logging
        # Create a logger
        self.logger: logging.Logger = logging.getLogger(f"MasterLogger ({process})")
        self.logger.setLevel(logging.DEBUG)  # Set the logging level

        # Create a file handler to log to a file
        self.file_handler: logging.FileHandler = logging.FileHandler("app.log" if path is None else os.path.join(path, "app.log"))
        self.file_handler.setLevel(logging.DEBUG)  # Log all levels to the file

        # Create a console handler to log to the console
        self.console_handler = logging.StreamHandler() # Don't type specify for this
        self.console_handler.setLevel(logging.INFO)  # Log only INFO and above to the console

        # Create a formatter and set it for both handlers
        self.formatter: logging.Formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        self.file_handler.setFormatter(self.formatter)
        self.console_handler.setFormatter(self.formatter)

        # Add the handlers to the logger
        self.logger.addHandler(self.file_handler)
        self.logger.addHandler(self.console_handler)

    def conditional_log(self, msg: str, condition: bool, level: str) -> None:
        levels = {
            "critical": self.critical,
            "error": self.error,
            "info": self.info,
            "warn": self.warn,
            "debug": self.debug
        }

        if condition:
            try:
                levels[level](msg)
            except KeyError:
                self.error(f"Conditional log fail, \"{level}\" is not a level. Attempted message: {msg}")

        return

    def critical(self, msg: str) -> None:
        self.logger.critical(msg)
        return

    def error(self, msg: str) -> None:
        self.logger.error(msg)
        return
    
    def info(self, msg: str) -> None:
        self.logger.info(msg)
        return
    
    def warn(self, msg: str) -> None:
        self.logger.warning(msg)
        return
    
    def debug(self, msg: str) -> None:
        self.logger.debug(msg)
        return